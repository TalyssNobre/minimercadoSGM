import { getSupabaseServer } from "@/src/lib/supabaseServer";

export async function authAdmin() {
    const supabase = await getSupabaseServer();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Sessão expirada. Faça login novamente.");
    }

    const { data: profile } = await supabase.from("User") .select("profile").eq("id", user.id).single();

    if (profile?.role !== 'Admin') {
        throw new Error("Acesso Negado. Somente administradores podem acessar");
    }

    return user; 
}