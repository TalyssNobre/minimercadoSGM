'use server'
import * as SaleService from "../services/SaleService"
import { revalidatePath } from "next/cache";

export const createSale = async(dataFront) =>{
    try{

        const data = Object.fromEntries(dataFront.entries());
        console.log("Oq esta vindo do front: ", data)
        const itensCarrinho = JSON.parse(data.cart);
        console.log("chegando", data,itensCarrinho);
        const results = await SaleService.createSale({
            data: data,
            itensCarrinho: itensCarrinho
        });
        if (results.error) return { success: false,sale: results,  message: results.error };
        revalidatePath("/caixa");
        return{ success: true, message: "Venda Criada!"}
    }catch(error){return{error: error.message}}
}

export const getAllSales = async() =>{
    try{
        const results =await SaleService.getAllSales();
         if (!results || results.error) {
            return { success: false, data: [], message: results.error };
        }
        return { success: true, data: results.sale };
    }catch(error){
        return { success: false, message: "Erro de conexão" };
}
}

export const updateSaleStatus = async (sale_id) => {
    const result = await SaleService.updateSaleStatus(sale_id);
    if (result.success) {
        revalidatePath("/extratos");
    }
    return result;
};

export const deleteSale = async(id) =>{
    try{
        const results = await SaleService.deleteSale(id);
        if (results.error) return { success: false,sale: results,  message: results.error };
        revalidatePath("/admin/historico-vendas");
        return{success: true , message: "Venda Excluída"}
    }catch(error){return{error: error.message}}
}

export const fetchMemberStatement = async(member_id) => {
    if (!member_id) return { success: false, message: "ID do membro é obrigatório" };
    return await SaleService.getMemberStatement(member_id);
};

export const settleMultipleSales = async (id) => {
    try {
        if (!id || id.length === 0) {
            return { success: false, message: "Nenhuma venda selecionada." };
        }

        for (const id_sale of id) {
            const result = await SaleService.updateSaleStatus(id_sale);
            if (!result.success) {
                throw new Error(`Erro ao dar baixa na venda ${id_sale}`);
            }
        }
        
        revalidatePath("/extratos");
        return { success: true, message: "Fiado quitado com sucesso!" };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

