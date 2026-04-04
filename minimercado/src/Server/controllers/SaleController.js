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
        revalidatePath("/sale");
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
export const deleteSale = async(id) =>{
    try{
        const results = await SaleService.deleteSale(id);
        if (results.error) return { success: false,sale: results,  message: results.error };
        revalidatePath("/sale");
        return{success: true , message: "Venda Excluída"}
    }catch(error){return{error: error.message}}

}