import { getSupabaseServer } from "@/src/lib/supabaseServer";

export const createUser = async (user) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("User").insert([{user_id: user.id,name: user.name,email: user.email,profile: user.profile,}]).select().single();

    if (error) throw new Error("Erro ao criar perfil do usuário: " + error.message);
    return data;
};

export const getAllUsers = async () => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("User").select("*").order("name", { ascending: true });

    if (error) throw new Error("Erro ao buscar usuários: " + error.message);
    return data;
};

export const getUserById = async (authId) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("User").select("*").eq("user_id", authId).maybeSingle();

    if (error) throw new Error("Erro ao buscar usuário: " + error.message);
    return data;
};

export const deleteUser = async (id) => {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.from("User").delete().eq("id", id);

    if (error) throw new Error("Erro ao deletar usuário: " + error.message);
    return true;
};

export const getUserProfileByAuthId = async (authId) => {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase.from("User").select("name, profile").eq("user_id", authId).maybeSingle();

    if (error) throw new Error("Erro ao buscar perfil do usuário: " + error.message);
    return data;
};
