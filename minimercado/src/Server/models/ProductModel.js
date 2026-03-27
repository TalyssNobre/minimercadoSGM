
import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createProduct = async(productEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Product").insert(productEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateProduct = async(id, productEntity) => {
   const supabase = await getSupabaseServer();

   const{data,error} = await supabase.from("Product").update(productEntity).eq("id", id).select().single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllProducts = async() => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Product").select("*");
   if(error){ throw new Error(error.message);
    } return data;
}

export const getProductById = async(id) => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Product").select("*").eq("id", id).single();
   if(error){ throw new Error(error.message);
    } return data;
}


export const deleteProduct = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Product").delete().eq("id", id).select().single()
       if(error){ throw new Error(error.message);
    } return data;
}
