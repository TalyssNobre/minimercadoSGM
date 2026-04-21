'use server'

import { authAdmin, authUser } from "@/src/Server/utils/auth";
import {getSupabaseAdmin} from "@/src/lib/supabaseServer"
import * as UserService from "@/src/Server/services/UserService";
import { revalidatePath } from "next/cache";


export async function loginController({ email, password }) {
    try {
        if (!email || !password) {
            return { success: false, message: "Preencha todos os campos." };
        }

        const result = await UserService.loginUser({ email, password });
        if (result.error) {
            return { success: false, message: result.error };
        }

        return { success: true, user: result.user, message: "Login realizado com sucesso!"  };

    } catch (error) {
        console.error("Erro no UserController:", error);
        return { success: false, message: error.message};
    }
}


export async function logoutController() {
    try {
        const result = await UserService.logoutUser();
        
        if (result.error) {
            return { success: false, message: result.error };
        }

        return { success: true };
    } catch (error) {
        return { success: false, message: "Erro inesperado ao sair." };
    }
}

export async function registerUserAction(dataFront) {
    try {
        await authAdmin();
        const data = dataFront.data; 
        const result = await UserService.createUser({ data: data });

        const erroReal = result.error || result.erro;
        if (erroReal) {
            return { success: false, message: erroReal };
        }

        revalidatePath("/admin/users");
        return { success: true, message: "Usuário criado com sucesso!" };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function deleteUserAction({id}) {
    try {
        await authAdmin(); 
        const result = await UserService.deleteUser(id); 
        revalidatePath("/admin/users");
        return { success: true, message: "Usuário removido do sistema." };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getLoggedUserController() {
    try {
        await authUser();
        const result = await UserService.getLoggedUserData();

        if (result.error) {
            return { success: false, message: result.error };
        }

        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, message: "Erro inesperado ao buscar usuário logado." };
    }
}

export async function getAllUsersController() {
    try {
        await authAdmin();
        const result = await UserService.getAllUsers();
        
        if (result.erro) {
            return { success: false, message: result.erro };
        }
        
        return { success: true, users: result.usuarios };
    } catch (error) {
        return { success: false, message: "Erro inesperado ao buscar usuários." };
    }
}