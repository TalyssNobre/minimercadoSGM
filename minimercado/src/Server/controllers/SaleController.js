'use server'
import * as SaleService from "../services/SaleService"
import { revalidatePath } from "next/cache";
import { authAdmin, authUser } from "../utils/auth";

export const createSale = async(dataFront) =>{
    try{
        await authUser();
        const data = Object.fromEntries(dataFront.entries());
        const itensCarrinho = JSON.parse(data.cart);
        const results = await SaleService.createSale({
            data: data,
            itensCarrinho: itensCarrinho
        });
        if (results.error) return { success: false,sale: results,  message: results.error };
        revalidatePath("/caixa");
        return{ success: true, message: "Venda Criada!"}
    }catch(error){
        return{sucess: false , message: error.message}
    }
}

export const getAllSales = async() =>{
    try{
        await authUser();
        const results =await SaleService.getAllSales();
         if (!results || results.error) {
            return { success: false, data: [], message: results.error };
        }
        return { success: true, data: results.sale };
    }catch(error){
        return { success: false, message: error.message };
}
}

export const updateSaleStatus = async (sale_id) => {
    await authUser();
    const result = await SaleService.updateSaleStatus(sale_id);
    if (result.success) {
        revalidatePath("/extratos");
    }
    return result;
};

export const deleteSale = async (dataFront) => {
    try {
        await authAdmin();
        const id = (dataFront && typeof dataFront.get === 'function') ? dataFront.get("id") : dataFront;
        if (!id) {
            return { success: false, message: "Erro: ID da venda não foi recebido." };
        }
        const results = await SaleService.deleteSale(id);
        if (results.error) {
            return { success: false, message: results.error };
        } 
        revalidatePath("/admin/historico-vendas");
        return { success: true, message: "Venda Excluída" };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export const fetchMemberStatement = async(member_id) => {
    await authUser();
    if (!member_id) return { success: false, message: "ID do membro é obrigatório" };
    return await SaleService.getMemberStatement(member_id);
};

export const settleMultipleSales = async (id) => {
    try {
        await authUser();
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

