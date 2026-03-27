import { getSupabaseServer } from "@/src/lib/supabaseServer";

/**
 * Cria o perfil do usuário na tabela 'User' após o Auth disparar.
 * @param {User} user - Instância da UserEntity
 */
export const createUser = async (user) => {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
        .from("User")
        .insert([
            {
                id: user.id, // O ID que veio do supabase.auth
                name: user.name,
                email: user.email,
                profile: user.profile,
                created_at: new Date()
            }
        ])
        .select()
        .single();

    if (error) throw new Error("Erro ao criar perfil do usuário: " + error.message);
    return data;
};

export const getAllUsers = async () => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
        .from("User")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw new Error("Erro ao buscar usuários: " + error.message);
    return data;
};

export const getUserById = async (authId) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("user_id", authId)
        .maybeSingle();

    if (error) throw new Error("Erro ao buscar usuário: " + error.message);
    return data;
};

export const deleteUser = async (id) => {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
        .from("User")
        .delete()
        .eq("id", id);

    if (error) throw new Error("Erro ao deletar usuário: " + error.message);
    return true;
};