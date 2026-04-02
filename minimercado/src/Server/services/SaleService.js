import * as SaleModel from "../models/SaleModel";
import * as ItemSaleModel from "../models/ItemSaleModel";
import Sale from "../entitys/SaleEntity";
import ItemSale from "../entitys/ItemSaleEntity";

export const createSale = async ({ data, itensCarrinho }) => {
    try {
        if (!itensCarrinho || itensCarrinho.length === 0) {
            throw new Error("Não é possível finalizar uma venda sem itens no carrinho.");
        }
        const saleEntity = new Sale({ ...data, items: itensCarrinho });
        
        const results = await SaleModel.createSale(saleEntity);

        const itensVinculados = itensCarrinho.map(item => {
            const itemVinculado = new ItemSale({
                ...item,
                sale_id: results.id 
            });
            return { ...itemVinculado };
        });

        await ItemSaleModel.createItems(itensVinculados);

        return { success: true, sale: results };

    } catch (error) {
        return { sucess: false, error: error.message };
    }
};