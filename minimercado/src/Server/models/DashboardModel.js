import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createrDashboard = async () => {
    const supabase = await getSupabaseServer();

    const { data: sales, error: salesError } = await supabase.from('Sale').select(`*,Item_sale ( product_id, quantity, unit_price, item_discount )`);
    const { data: products, error: prodError } = await supabase.from('Product').select('id, price, category_id');
    const { data: categories, error: catError } = await supabase.from('Category').select('id, name');

    if (salesError || prodError || catError) {
        throw new Error("Erro ao buscar os dados financeiros no banco.");
    }

    return { sales, products, categories };
};