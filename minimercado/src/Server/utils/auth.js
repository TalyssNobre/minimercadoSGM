import { getSupabaseServer } from "@/src/lib/supabaseServer";

export async function authAdmin() {
    const supabase = await getSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não logado");

    const { data: record } = await supabase
        .from("User")
        .select("profile") 
        .eq("user_id", user.id)
        .maybeSingle();

    if (!record || record.profile !== 'Admin') {
        throw new Error("Acesso Negado. Somente administradores podem acessar");
    }

    return user; 
}