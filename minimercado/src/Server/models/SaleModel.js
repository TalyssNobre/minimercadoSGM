import { getSupabaseServer } from "../../lib/supabaseServer";

export const createSale = async(SaleEntity) =>{
     const supabase = await getSupabaseServer();
     const { items, ...SaleData } = SaleEntity;
     console.log("OQ TA INDO NA ENTITY:", SaleData);
    const {data, error} = await supabase.from("Sale").insert(SaleData).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const getSaleById = async(id) => {
    const supabase= await getSupabaseServer();
    const {data, error} = await supabase.from("Sale").select("*").eq("id", id).maybeSingle();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const getAllSales = async() =>{
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Sale").select("*").maybeSingle();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const deleteSale = async(id) =>{
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Sale").select("*").eq("id", id).maybeSingle();
    if(error){
        throw new Error(error.message);
    } return data;
}