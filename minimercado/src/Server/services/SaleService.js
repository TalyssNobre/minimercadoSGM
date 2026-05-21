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

        for (const item of items) {
            const newProduct = await ProductModel.getProductById(item.product_id);
            if (!newProduct) throw new Error("Produto não encontrado.");

            // 🟢 CORREÇÃO: Pega os valores direto do banco de dados (100% Seguro)
            const precoBase = newProduct.base_price > 0 ? Number(newProduct.base_price) : Number(newProduct.price);
            const emPromo = Boolean(newProduct.promo_status);
            const precoEfetivo = (emPromo && Number(newProduct.promo_price) > 0) ? Number(newProduct.promo_price) : precoBase;
            
            // 🟢 Calcula o desconto TOTAL desta linha (ex: 2 unidades x R$ 2,00 = R$ 4,00)
            const descontoDaLinha = (precoBase - precoEfetivo) * item.quantity;

            dataFrontVerify.push({
                ...item,
                unit_price: precoBase,       // Salva o preço cheio bruto (Ex: 6.00)
                price: precoEfetivo,         // Referência do preço pago
                item_discount: descontoDaLinha // Salva o desconto total (Ex: 4.00)
            });
        }

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
                sale_id: results.id 
            });

            return {
                quantity: itemEntity.quantity,
                unit_price: itemEntity.unit_price, 
                product_id: itemEntity.product_id,
                sale_id: itemEntity.sale_id,
                item_discount: itemEntity.item_discount || 0
            }; 
        });

        await ItemSaleModel.createItems(itensComVinculo);
        
        for (const item of items) {
            const newProduct = await ProductModel.getProductById(item.product_id);

            if (newProduct && newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo) || []);

                for (const itemDoCombo of comboArray) {
                    const idDoIngrediente = itemDoCombo.product_id;
                    const qtdDoIngrediente = itemDoCombo.quantity;

                    if (!idDoIngrediente) continue; 

                    const totalParaBaixar = qtdDoIngrediente * item.quantity;
                    await ProductModel.updateProductStock(idDoIngrediente, -totalParaBaixar);
                }
            } else {
                await ProductModel.updateProductStock(item.product_id, -item.quantity);
            }
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
        
        for (const item of itemsToRestore) {
            if (!item || !item.product_id) continue; 

            const newProduct = await ProductModel.getProductById(item.product_id);

            if (newProduct && newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo) || []);

                for (const ingrediente of comboArray) {
                    const idDoIngrediente = ingrediente.product_id;
                    const qtdDoIngrediente = ingrediente.quantity;

                    if (!idDoIngrediente) continue;

                    const totalParaDevolver = qtdDoIngrediente * item.quantity;
                    await ProductModel.updateProductStock(idDoIngrediente, totalParaDevolver);
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