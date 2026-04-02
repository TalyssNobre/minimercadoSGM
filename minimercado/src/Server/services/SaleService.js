import * as SaleModel from "../models/SaleModel";
import * as ItemSaleModel from "../models/ItemSaleModel";
import Sale from "../entitys/SaleEntity";
import ItemSale from "../entitys/ItemSaleEntity";

export const createSale = async ({ data, itensCarrinho }) => {
    try {

        console.log("oq ta dindo do front:", data, itensCarrinho)
        if (!itensCarrinho || itensCarrinho.length === 0) {
            throw new Error("Não é possível finalizar uma venda sem itens no carrinho.");
        }
        const saleEntity = new Sale({ 
            ...data, 
            items: itensCarrinho 
        });
        const { cart, ...dadosLimpos } = data;

        // 2. Montamos o "Payload" final com o nome que a Entity espera (items)
        const dataClean = {
            ...dadosLimpos,
            items: itensCarrinho // Aqui o nome morre como 'itensCarrinho' e nasce como 'items'
        };
        const {items, ...dataSale} = saleEntity
        
        const results = await SaleModel.createSale(dataSale);

         const itensComVinculo = items.map(item => {
            return new ItemSale({
                ...item,      
                sale_id: results.id 
            });
        });
       

        await ItemSaleModel.createItems(itensComVinculo);

        return { success: true, sale: results };

    } catch (error) {
        return { sucess: false, error: error.message };
    }
};