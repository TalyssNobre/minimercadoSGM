
import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createCategory = async(categoryEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Category").insert(categoryEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateCategory = async(id, categoryEntity) => {
   const supabase = await getSupabaseServer();
   const{data,error} = await supabase.from("Category").update(categoryEntity).eq("id", id).select().single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllCategory = async() => {
    const supabase = await getSupabaseServer();
    const{data,error} = await supabase.from("Category").select("*");
   if(error){ throw new Error(error.message);
    } return data;
}

export const getCategoryById = async(id) => {
    const supabase = await getSupabaseServer();
    const{data,error} = await supabase.from("Category").select("*").eq("id", id).single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const findByName = async(name) => {
    const supabase = await getSupabaseServer();
    const{data,error} = await supabase.from("Category").select("*").eq("name", name).maybeSingle();
   if(error){ throw new Error(error.message);
    } return data;
}

export const deleteCategory = async(id) =>{
    const supabase = await getSupabaseServer();
    const{data,error} = await supabase.from("Category").delete().eq("id", id).select().maybeSingle()
       if(error){ throw new Error(error.message);
    } return data;
}
