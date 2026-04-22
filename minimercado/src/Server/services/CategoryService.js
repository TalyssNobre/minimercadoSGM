'use server'
import { getSupabaseServer } from '@/src/lib/supabaseServer';
import Category from "../entitys/CategoryEntity";
import * as CategoryModel from "../models/CategoryModel"

export const createCategory = async ({data}) => {
    const categoryexisting = await CategoryModel.findByName(data.name)
    if(categoryexisting){
        throw new Error("Categoria já existente")
    }
    try{
        const categoryEntity  = new Category(data);
        const results = await CategoryModel.createCategory(categoryEntity);
        return {success: true, category : results}
    }catch(error){
        return { error: error.message };
    }
}

export const getAllCategory = async() => {
     try{
        const results = await CategoryModel.getAllCategory();
        return{success : true, category : results}
    } catch(error){
        return{error: error.message}
    }
}

export const getCategoryById = async ({id}) => {
    const supabase = await getSupabaseServer();
    const {data : categoryId} =  await supabase.from("Category").select("*").eq("id", id).single();
    if(!categoryId){
        throw new Error("Categoria Inexistente")
    }
    try{
        const results = await CategoryModel.getCategoryById(id);
        return{success : true, category : results}
    }catch(error){
        return{error: error.message}
    }
}

// 🟢 NOVA FUNÇÃO ADICIONADA: Atualizar Categoria
export const updateCategory = async ({data}) => {
    const supabase = await getSupabaseServer();
    
    // Verifica se a categoria existe antes de atualizar
    const {data : existingCategory} = await supabase.from("Category").select("*").eq("id", data.id).single();
    if(!existingCategory){
        throw new Error("Categoria Inexistente");
    }

    try {
        const categoryEntity = new Category(data);
        const results = await CategoryModel.updateCategory(data.id, categoryEntity);
        return { success: true, category: results };
    } catch (error) {
        return { error: error.message };
    }
}

// 🟢 NOVA FUNÇÃO ADICIONADA: Deletar Categoria
export const deleteCategory = async (id) => {
    const supabase = await getSupabaseServer();
    
    // Verifica se a categoria existe
    const {data : existingCategory} = await supabase.from("Category").select("*").eq("id", id).single();
    if(!existingCategory){
        throw new Error("Categoria Inexistente");
    }

    try {
        const results = await CategoryModel.deleteCategory(id);
        return { success: true, category: results };
    } catch (error) {
        return { error: error.message };
    }
}