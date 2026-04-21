'use server'
import { authAdmin,authUser } from "@/src/Server/utils/auth";
import { formatText } from "@/src/Server/utils/formatter";
import * as ProductService from "../services/ProductService";
import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSupabaseAdmin } from "../../lib/supabaseServer";


export async function createProduct(dataFront) {
    try {
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const image = dataFront.get("image"); 

        const results = await ProductService.createProduct({ 
            data: data, 
            image: image
        });
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/produtos");
        return { success: true, message: "Produto cadastrado!" };

    } catch (error) {
        return { success: false ,message: error.message };
    }
}

export async function updateProduct(dataFront) {
    try{
        await authAdmin();
         const id = dataFront.get("id")
         const imagem = dataFront.get("image");
         const data = Object.fromEntries(dataFront.entries());
         if (data.name) {
            data.name = formatText(data.name);
        }
         const results = await ProductService.updateProduct({
            data : data,
            id : id,
            image: imagem
         });
         if(results.error) { return{success: false, message: results.error}}
         revalidatePath("/produtos");
         return { success:true, message: "Produto Atualizado"}
    }catch (error) {
        return { success: false, message: "Erro de conexão" };
    }
} 

export async function getAllProducts() {
    try{
        await authUser();
        const results = await ProductService.getAllProducts() 
    if (!results || results.error) {
            return { success: false, data: [], message: results.error };
        }
        return { success: true, data: results.product };
    } catch (error) {
        return { success: false, data: [], message: error.message };
    }
} 

export async function getProductById(id) {
    try{
        await authUser();
        const results = await ProductService.getProductById(id)
         if(results.error) { return{success: false, message: results.error}
        }return { success:true,data : results.product, message: "Produto Encontrado"}
    }catch(error){
        return { success: false, message: "Erro de conexão" };
    }
}

 export async function deleteProduct (id) {
    try{
        await authAdmin();
        const results = await ProductService.deleteProduct(id)
         if(results.error) { return{sucess: false, message: results.error}
        }
        revalidatePath("/produtos");
    
        return { success:true, message: "Produto excluido"}
    }catch(error){
        return { success: false, message: "Erro de conexão" };
    }
} 