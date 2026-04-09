import { getSupabaseServer } from "../../lib/supabaseServer"

export const createItems = async (itensComVinculo) => {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("Item_sale") 
        .insert(itensComVinculo);

    if (error) {
        console.error("Erro no Supabase (Item_sale):", error.message);
        throw new Error("Não foi possível salvar os itens da venda.");
    }

    return data;
};

export const deleteItemSaleById = async(id) =>{
    const supabase = await getSupabaseServer();
const { data, error } = await supabase.from("Item_sale").delete().eq("sale_id", id);
    if(error){
        throw new Error(error.message);
    } return data;
}


export const getItemsBySaleId = async (saleId) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
        .from("Item_sale")
        .select("*")
        .eq("sale_id", saleId);
        
    if (error) throw new Error(error.message);
    return data;
}