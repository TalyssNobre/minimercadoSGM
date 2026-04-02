'use server'
import {getSupabaseAdmin, getSupabaseAdmin} from "../../lib/supabaseServer"
import {AuthAdmin} from "../utils/auth"
import * as SaleService from "../services/SaleService"
import { revalidatePath } from "next/cache";

export const createSale = async(dataFront) =>{
    try{
        await AuthAdmin();
        const data = Object.fromEntries(dataFront.entries());

        const itensCarrinho = JSON.parse(data.cart);

        const results = await SaleService.createSale({
            data: data,
            itensCarrinho: itensCarrinho
        });
        if (results.error) return { success: false,sale: results,  message: results.error };
        revalidatePath("/sale");
        return{ success: true, message: "Venda Criada!"}
    }catch(error){return{error: error.message}}
}