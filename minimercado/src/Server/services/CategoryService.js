'use server'
import { getSupabaseServer } from '@/src/lib/supabaseServer';
import Category from "../entitys/CategoryEntity";
import * as CategoryModel from "../models/CategoryModel"

export const createCategory = async ({data}) => {
    const supabase = await getSupabaseServer();
    
    const categoryexisting = data.name.toLowerCase();
    const {data: categorynew} = await supabase.from("Category").select("*").eq("name", categoryexisting).single();
    if(categorynew){
        return{erro : "Categoria já existente"}
    }
    try{
        const categoryEntity  = new Category(data);
        const results = await CategoryModel.createCategory(categoryEntity);
        return {success: true, categoria : results}
    }catch(error){
        return { error: error.message };
    }
}

/*export const getAllCategory = async () => {
    try{
        const results = await CategoryModel.getAllCategory();
        return{success : true, team : results.data}
    } catch(error){
        return{error: error.message}
    }  
}*/

export const getAllCategory = async() => {
    const supabase = await getSupabaseServer();
     try{
        const results = await CategoryModel.getAllCategory();
        return{success : true, categoria : results}
    } catch(error){
        return{error: error.message}
    }
}

export const getCategoryById = async ({data}) => {
    const supabase = await getSupabaseServer();
    const {data : categoryId} =  await supabase.from("Category"). select("id", id).single();
    if(!categoryId){
        return{ erro : "Categoria Inexistente"}
    }
    try{
        const results = await CategoryModel.getCategoryById(id);
        return{success : true, categoria : results}
    }catch(error){
        return{error: error.message}
    }
}
