import { getSupabaseServer, getSupabaseAdmin } from '@/src/lib/supabaseServer';
import User from "../entitys/UserEntity";
import * as UserModel from "../models/UserModel";

export const createUser = async ({data}) => {
    try {
        const userEntity = new User({
            id: 'validacao-apenas', 
            name: data.nome,
            email: data.email,
            profile: data.profile
        });

        const supabase = await getSupabaseAdmin();
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.senha,
            options : {
                data : {profile : data.profile}
            }
    });

        if (authError){ throw new Error(authError.message);}
        userEntity.id = authData.user.id;
        await UserModel.createUser(userEntity);

        return { success: true };
    } catch (error) {
        return { error:  error.message };
    }
}

export const loginUser = async ({email , password}) => {
    const supabase = await getSupabaseServer();
    const {data : authData, error : authError } = await supabase.auth.signInWithPassword({email : email, password: password});
    if(authError){
        throw new Error("Email ou senha invalido")
    }
    try {
        const userProfile = await UserModel.getUserById(authData.user.id);
        return { success: true, user: userProfile };
    } catch (error) {
        return { error: "Erro ao logar" };
    }
}

export const logoutUser = async () => {
    const supabase =  await getSupabaseServer();
    const {error} = await supabase.auth.signOut()
    if(error){
        throw new Error("Erro ao sair do sistema")
    }
        return{sucesso: true, mensagem: "Saindo do server"};
}

export const getAllUsers = async() => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("User").select("*")
    if(error){
        return{erro : error.message};
    } 
    return{sucesso : true, usuarios: data};
}

export const getIdByUser = async({id}) => {
    const supabase = await getSupabaseServer();
    const {data: userId} = await supabase.from("User").select("*").eq("id", id).single()
    if(!userId){
    throw new Error("Usuario não encontrado");
    }
    try{
        const results = await UserModel.getUserById(id);
        return{success : true, team : results}
    }catch(error){
        return{error: "Erro ao buscar"}
    }
}

export const deleteUser = async (id) => {
    try {
        await UserModel.deleteUser(id);
        return { success: true, message: "Usuário removido" };
    } catch (error) {
        return { error: error.message };
    }
}
export const getLoggedUserData = async () => {
    try {
        const supabase = await getSupabaseServer();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return { error: "Nenhum usuário logado." };
        }
        const userData = await UserModel.getUserById(user.id);

        return { 
            success: true,
            user: {
                id: userData?.id,
                name: userData?.name || user.email, 
                profile: userData?.profile || 'Operador'
            }
        };
    } catch (error) {
        return { error: error.message };
    }
}