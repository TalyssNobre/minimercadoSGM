import Sale from "../entitys/SaleEntity";
import * as SaleModel from "../models/SaleModel";
import ItemSale from "../entitys/ItemSaleEntity";
import * as ItemSaleModel from "../models/ItemSaleModel";
import Product from "../entitys/ProductEntity";
import * as ProductModel from "../models/ProductModel";
import { ensureArray, safeParseJSON } from "../utils/formatter";

export const createSale = async ({ data, items }) => { 

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Não é possível finalizar uma venda sem itens no carrinho");
    }
    
    try {
        const dataFrontVerify = [];
        const stockNeeded = {}; // 🟢 MAPA PARA ACUMULAR TUDO QUE VAI SAIR DO ESTOQUE

        // 1. Montagem dos itens financeiros E mapeamento da necessidade de estoque
        for (const item of items) {
            const newProduct = await ProductModel.getProductById(item.product_id);
            if (!newProduct) throw new Error("Produto não encontrado.");

            const precoBase = newProduct.base_price > 0 ? Number(newProduct.base_price) : Number(newProduct.price);
            const emPromo = Boolean(newProduct.promo_status);
            const precoEfetivo = (emPromo && Number(newProduct.promo_price) > 0) ? Number(newProduct.promo_price) : precoBase;
            
            const descontoDaLinha = (precoBase - precoEfetivo) * item.quantity;

            dataFrontVerify.push({
                ...item,
                unit_price: precoBase,   
                price: precoEfetivo, 
                item_discount: descontoDaLinha 
            });

            // 🟢 MAPEIA A NECESSIDADE DE ESTOQUE (Combos e Simples)
            if (newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo) || []);
                const customizacoes = ensureArray(item.customizacao || []);
                let customIndex = 0;

                for (const itemDoCombo of comboArray) {
                    const qtdDoIngrediente = itemDoCombo.quantity || 1;
                    const totalParaBaixar = qtdDoIngrediente * item.quantity;
                    const idFixo = itemDoCombo.product_id || itemDoCombo.produto_id;

                    if (!idFixo || itemDoCombo.tipo === 'categoria' || itemDoCombo.is_category_choice) {
                        const escolhaUsuario = customizacoes[customIndex];
                        customIndex++;
                        const idEscolhido = escolhaUsuario?.id || escolhaUsuario?.product_id || escolhaUsuario?.produto_id;
                        if (idEscolhido) {
                            stockNeeded[Number(idEscolhido)] = (stockNeeded[Number(idEscolhido)] || 0) + totalParaBaixar;
                        }
                    } else {
                        stockNeeded[Number(idFixo)] = (stockNeeded[Number(idFixo)] || 0) + totalParaBaixar;
                    }
                }
            } else {
                stockNeeded[item.product_id] = (stockNeeded[item.product_id] || 0) + item.quantity;
            }
        }

        // 2. 🟢 PRÉ-VALIDAÇÃO DE ESTOQUE (O Escudo!)
        // Antes de salvar a venda, verifica se tem estoque de tudo que foi mapeado
        for (const productId of Object.keys(stockNeeded)) {
            const checkProduct = await ProductModel.getProductById(productId);
            if (!checkProduct) throw new Error("Produto do estoque não encontrado.");
            
            if (checkProduct.stock < stockNeeded[productId]) {
                // Aborta a venda INTEIRA se qualquer item estourar o limite (sem sujar o histórico)
                throw new Error(`Estoque insuficiente para "${checkProduct.name}". Solicitado: ${stockNeeded[productId]}, Disponível: ${checkProduct.stock}.`);
            }
        }

        // 3. Como passou no teste de estoque, agora SIM salvamos no Banco de Dados!
        const saleEntity = new Sale({ 
            ...data, 
            items: dataFrontVerify,
            discount:  data.discount
        });

        const dataSale = {
            date: saleEntity.date,
            total_value: saleEntity.total_value,
            payment_date: saleEntity.payment_date,
            status: saleEntity.status,
            user_id: saleEntity.user_id,
            member_id: saleEntity.member_id,
            discount : saleEntity.discount
        };

        const results = await SaleModel.createSale(dataSale);
        
        const itensComVinculo = saleEntity.items.map(item => {
            const itemEntity = new ItemSale({
                ...item,      
                sale_id: results.id,
                customizacao: item.customizacao ? JSON.stringify(item.customizacao) : null
            });

            return {
                quantity: itemEntity.quantity,
                unit_price: itemEntity.unit_price, 
                product_id: itemEntity.product_id,
                sale_id: itemEntity.sale_id,
                item_discount: itemEntity.item_discount || 0,
                customizacao: itemEntity.customizacao
            }; 
        });

        await ItemSaleModel.createItems(itensComVinculo);
        
        // 4. Baixa do estoque (agora com 100% de certeza que não vai dar erro)
        for (const productId of Object.keys(stockNeeded)) {
            await ProductModel.updateProductStock(Number(productId), -stockNeeded[productId]);
        }

        return { success: true, sale: results };
    } catch (error) {
        return { success: false, error: error.message }; 
    }
};

export const getAllSales = async() =>{
    try{
        const results = await SaleModel.getAllSales();
        return{success: true, sale: results}
    }catch(error){
        return{error: "Erro ao Buscar"}
    }
}

export const getSaleById = async(id) => {
    const saleExisting = await SaleModel.getSaleById(id);
    if(!saleExisting){
        throw new Error("Venda não encontrada")
    }
    try{
    const results = await SaleModel.getSaleById(id);
    return{sucess : true, sale: results}
    }catch(error){
        return{sucess: false , error :"Erro ao buscar"}
    }
}

export const updateSaleStatus = async (sale_id) => {
    try {
        const results = await SaleModel.updateSaleStatus(sale_id, true);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: "Erro ao atualizar" };
    }
};

export const deleteSale = async (id) => {
    try {
        const saleExisting = await SaleModel.getSaleById(id);
        if (!saleExisting) {
            return { success: false, error: "Venda não encontrada" };
        }

        const itemsToRestore = ensureArray(await ItemSaleModel.getItemsBySaleId(id));
        
        // 🟢 Estorno inteligente de estoque ao cancelar/deletar a venda (lendo a customização salva)
        for (const item of itemsToRestore) {
            if (!item || !item.product_id) continue; 

            const newProduct = await ProductModel.getProductById(item.product_id);

            if (newProduct && newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo) || []);
                const customizacoes = ensureArray(safeParseJSON(item.customizacao) || item.customizacao || []);
                let customIndex = 0;

                for (const ingrediente of comboArray) {
                    const qtdDoIngrediente = ingrediente.quantity || 1;
                    const totalParaDevolver = qtdDoIngrediente * item.quantity;

                    const idFixo = ingrediente.product_id || ingrediente.produto_id;

                    if (!idFixo || ingrediente.tipo === 'categoria' || ingrediente.is_category_choice) {
                        const escolhaUsuario = customizacoes[customIndex];
                        customIndex++;

                        const idEscolhido = escolhaUsuario?.id || escolhaUsuario?.product_id || escolhaUsuario?.produto_id;
                        if (idEscolhido) {
                            await ProductModel.updateProductStock(Number(idEscolhido), totalParaDevolver);
                        }
                    } else {
                        await ProductModel.updateProductStock(Number(idFixo), totalParaDevolver);
                    }
                }
            } else {
                await ProductModel.updateProductStock(item.product_id, item.quantity);
            }
        }

        await ItemSaleModel.deleteItemSaleById(id);
        const results = await SaleModel.deleteSale(id);

        return { success: true, sale: results };

    } catch (error) {
        return { success: false, error: "Erro ao deletar venda" }; 
    }
}

export const getMemberStatement = async(member_id) => {
    try {
        const sales = await SaleModel.getSalesByMember(member_id);
        const pending = sales.filter(s => s.status === false || s.status === null);
        const paid = sales.filter(s => s.status === true);

        return { success: true, pending, paid };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getProductSalesStats = async (productId) => {
    try {
        const stats = await SaleModel.getProductSalesStats(productId);
        return stats;
    } catch (error) {
        throw new Error(error.message);
    }
}