import * as SaleModel from "../models/SaleModel";
import * as ItemSaleModel from "../models/ItemSaleModel";
import Sale from "../entitys/SaleEntity";
import ItemSale from "../entitys/ItemSaleEntity";

export const createSale = async ({ data, itensCarrinho }) => {
    console.log("Dados chegando do front:", data, itensCarrinho);
    if (!itensCarrinho || itensCarrinho.length === 0) {
            throw new Error("Não é possível finalizar uma venda sem itens no carrinho.");
        }
    try {
        const saleEntity = new Sale({ 
            ...data, 
            items: itensCarrinho 
        });

        const dataSale = {
            date: saleEntity.date,
            total_value: saleEntity.total_value,
            payment_date: saleEntity.payment_date,
            status: saleEntity.status,
            user_id: saleEntity.user_id,
            member_id: saleEntity.member_id
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

export const deleteSale = async(id) => {
   const saleExisting = await SaleModel.getSaleById(id);
    if(!saleExisting){
        throw new Error("Venda não encontrada")
    }
    try{
    await ItemSaleModel.deleteItemSaleById(id);
    const results = await SaleModel.deleteSale(id);
    return{sucess : true, sale: results}
   }catch(error){
         return { success: false, error: error.message }; 
   }
}