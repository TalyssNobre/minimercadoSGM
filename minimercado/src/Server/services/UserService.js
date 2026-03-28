import { getSupabaseServer } from '@/src/lib/supabaseServer';
import User from "../entitys/UserEntity";
import * as UserModel from "../models/UserModel";



export const createUser = async ({data}) => {
    const supabase = await getSupabaseServer();
    const emailexisting = data.email.toLowerCase().trim();
    
    const {data: userexisitng} = await supabase.from("User").select("*").eq("email", emailexisting).single();
     if (userexisitng) {
        return { erro: "E-mail já cadastrado" };
    }
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({email: emailexisting,password: data.senha || data.password,options: {
                data: {name: data.nome, profile: data.profile || 'Operador'} }});
        if (authError) {
            return { erro: "Erro na autenticação: " + authError.message };
        }
        const userEntity = new User({
            id: authData.user.id,
            email: email,
            profile: data.profile || 'Operador'
        });

        const results = await UserModel.createUser(userEntity);
        return { sucesso: true, user: results};

    } catch (error) {
        console.error("Erro fatal no servidor:", error);
        return { erro: "Erro interno no servidor." };
    }
}

export const loginUser = async ({email , password}) => {
    const supabase = await getSupabaseServer();
    const {data : authData, error : authError } = await supabase.auth.signInWithPassword({email : email, password: password});
    if(authError){
        return{erro : "Email ou senha invalido"}
    }
    try {
        const userProfile = await UserModel.getUserById(authData.user.id);
        return { success: true, user: userProfile };
    } catch (error) {
        return { error: error.message };
    }
}


export const logoutUser = async () => {
    const supabase =  await getSupabaseServer();
    const {error} = await supabase.auth.signOut()
    if(error){
        return{erro: "Erro ao sair do sistema"}
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
    return{erro: "Usuario não encontrado"};
    }
    try{
        const results = await UserModel.getUserById(id);
        return{success : true, team : results}
    }catch(error){
        return{error: error.message}
    }
}

export const deleteUser = async (id) => {
    try {
        // Note: Deletar no Auth é diferente de deletar na tabela. 
        // Aqui deletamos apenas o perfil na sua tabela User via Model.
        await UserModel.deleteUser(id);
        return { success: true, message: "Usuário removido" };
    } catch (error) {
        return { error: error.message };
    }
}