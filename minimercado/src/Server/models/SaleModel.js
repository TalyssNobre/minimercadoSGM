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
