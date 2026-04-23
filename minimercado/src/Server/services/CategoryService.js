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
    const  existingCategory = await CategoryModel.getCategoryById(id);
    if(!existingCategory){
        throw new Error("Categoria não existe");
    }
    try{
        const results = await CategoryModel.getCategoryById(id);
        return{success : true, category : results}
    }catch(error){
        return{error: error.message}
    }
}


export const updateCategory = async ({data}) => {
    const  existingCategory = await CategoryModel.getCategoryById(data.id);
    if(!existingCategory){
        throw new Error("Categoria não existe");
    }
    try {
        const categoryEntity = new Category(data);
        const results = await CategoryModel.updateCategory(data.id, categoryEntity);
        return { success: true, category: results };
    } catch (error) {
        return { error: error.message };
    }
}

export const deleteCategory = async (id) => {
    const  existingCategory = await CategoryModel.getCategoryById(id);
    if(!existingCategory){
        throw new Error("Categoria não existe");
    }
    try {
        const results = await CategoryModel.deleteCategory(id);
        return { success: true, category: results };
    } catch (error) {
        return { error: error.message };
    }
}