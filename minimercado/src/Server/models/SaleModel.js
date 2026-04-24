import { getSupabaseServer } from "../../lib/supabaseServer";

export const createSale = async(SaleEntity) =>{
    const supabase = await getSupabaseServer();
    const { items, ...SaleData } = SaleEntity;
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
    const {data, error} = await supabase.from("Sale").select(` *,User (name),member (name),Item_sale (*,Product (name))`);

    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateSaleStatus = async(id, status) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("Sale").update({status: status, payment_date: status ? new Date().toISOString() : null }).eq("id", id);
        
    if (error) throw new Error(error.message);
    return data;
};

export const deleteSale = async(id) =>{
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Sale").delete().eq("id", id).maybeSingle();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const getSalesByMember = async(member_id) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("Sale").select(`  *,member (name),Item_sale (quantity,unit_price,Product (name,Category (name)))`).eq("member_id", member_id).order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};
