import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createProduct = async(productEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Product").insert(productEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateProduct = async(id, finalData) => {
   const supabase = await getSupabaseServer();
   const{data,error} = await supabase.from("Product").update(finalData).eq("id", id).select().single();
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

export const updateProductStock = async (productId, quantityChange) => {
    const supabase = await getSupabaseServer();

    const { data: product, error } = await supabase.from("Product").select("stock").eq("id", productId).single();
        
    if (error){
     throw new Error(error.message);}
    
    const newStock = Number(product.stock) + Number(quantityChange);
    
    const { data, error: updateError } = await supabase.from("Product").update({ stock: newStock }).eq("id", productId);
    
    if (updateError){ throw new Error(updateError.message);
    }return data;
}

export const findByName = async(name) => {
    const supabase = await getSupabaseServer();
    const{data,error} = await supabase.from("Product").select("*").eq("name", name).maybeSingle();
   if(error){ throw new Error(error.message);
    } return data;
}

export const deleteProduct = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Product").delete().eq("id", id).select().single()
       if(error){ throw new Error(error.message);
    } return data;
}
