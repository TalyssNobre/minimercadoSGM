'use server';
import { authAdmin, authUser } from "@/src/Server/utils/auth";
import { formatText } from "@/src/Server/utils/formatter";
 import * as categoryService from "../services/CategoryService"
 import { revalidatePath } from "next/cache";

 export async function createCategory(dataFront) {
    try{
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await categoryService.createCategory({data: data});
    if (results.error) return { success: false, message: results.error };
            revalidatePath("/categoria");
            return { success: true, data: results.category, message: "Categoria cadastrada!" };
    }catch(error){
        return { success: false, message: error.message };
    }
 }

 export async function updateCategory(dataFront) {
    try{
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await categoryService.updateCategory({
            data: data
        });
        if (results.error) return { success: false, message: results.error };
            revalidatePath("/categoria");
            return { success: true, message: "Categoria Atualizada!" };
    }catch(error){
        return { success: false, message: error.message };
    }
 }


export async function getAllCategory() {
    try{
        await authUser();
        const results = await categoryService.getAllCategory();
        if (!results || results.error) {
            return { success: false, data: [], message: "results.error" };
        }
        return { success: true, data: results.category };
    }catch (error) {
        return { success: false, data: [], message: error.message };
    }
}

 export async function getCategoryById(id) {
    try{
        await authUser();
        const results = await categoryService.getCategoryById(id);
        if(results.error) { return{success: false, message: results.error}
        }return { success:true,data : results.category, message: "Produto Encontrado"}
    }catch(error){
        return { success: false, message: error.message  };
    }
}

export async function deleteCategory (id) {
    try{
        await authAdmin();
        const results = await categoryService.deleteCategory(id)
         if(results.error) { return{sucess: false, message: results.error}
        }
        revalidatePath("/categoria");
    
        return { success:true, message: "Categoria excluida"}
    }catch(error){
        return { success: false, message: error.message  };
    }
}