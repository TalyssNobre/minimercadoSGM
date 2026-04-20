import * as SaleModel from "../models/SaleModel";
import * as ItemSaleModel from "../models/ItemSaleModel";
import Sale from "../entitys/SaleEntity";
import ItemSale from "../entitys/ItemSaleEntity";
import * as ProductModel from "../models/ProductModel";
import { ensureArray, safeParseJSON } from "../utils/formatter";

export const createSale = async ({ data, itensCarrinho }) => {
    console.log("Dados chegando do front:", data, itensCarrinho);
    if (!itensCarrinho || itensCarrinho.length === 0) {
            throw new Error("Não é possível finalizar uma venda sem itens no carrinho.");
        }
    
    try {
        const saleEntity = new Sale({ 
            ...data, 
            items: itensCarrinho,
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
                sale_id: itemEntity.sale_id
            }; 
        });

        await ItemSaleModel.createItems(itensComVinculo);
        
      // 🟢 CORREÇÃO AQUI: Baixa de Estoque
        for (const item of itensCarrinho) {
            const newProduct = await ProductModel.getProductById(item.product_id);

            if (newProduct && newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo));

                for (const itemDoCombo of comboArray) {
                    const idDoIngrediente = itemDoCombo.product_id || itemDoCombo.produto_id;
                    const qtdDoIngrediente = itemDoCombo.quantity || itemDoCombo.qty;

                    if (!idDoIngrediente) continue; 

                    const totalParaBaixar = qtdDoIngrediente * item.quantity;
                    await ProductModel.updateProductStock(idDoIngrediente, -totalParaBaixar);
                }
            } else {
                // Se NÃO for combo, baixa o produto normal
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
        return{error: error.message}
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
        return{sucess: false , error :error.message}
    }
}

export const updateSaleStatus = async (sale_id) => {
    try {
        const results = await SaleModel.updateSaleStatus(sale_id, true);
        return { success: true, data: results };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteSale = async (id) => {
    try {
        // 1. Verifica se a venda existe
        const saleExisting = await SaleModel.getSaleById(id);
        if (!saleExisting) {
            return { success: false, error: "Venda não encontrada" };
        }

        const itemsToRestore = ensureArray(await ItemSaleModel.getItemsBySaleId(id));
        
        for (const item of itemsToRestore) {
            if (!item || !item.product_id) continue; 

            const newProduct = await ProductModel.getProductById(item.product_id);

            if (newProduct && newProduct.combo) {
                const comboArray = ensureArray(safeParseJSON(newProduct.combo));

                for (const ingrediente of comboArray) {
                    const idDoIngrediente = ingrediente.product_id || ingrediente.produto_id;
                    const qtdDoIngrediente = ingrediente.quantity || ingrediente.qty;

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
        console.error("Erro ao deletar venda:", error);
        return { success: false, error: error.message }; 
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
