import { getSupabaseServer } from "../../lib/supabaseServer"

export const createItems = async (itemsArray) => {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("Item_sale") 
        .insert(itemsArray);

    if (error) {
        console.error("Erro no Supabase (Item_sale):", error.message);
        throw new Error("Não foi possível salvar os itens da venda.");
    }

    return data;
};