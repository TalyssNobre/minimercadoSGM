'use server'

import { authAdmin, authUser } from "@/src/Server/utils/auth";
import * as UserService from "@/src/Server/services/UserService";
import { revalidatePath } from "next/cache";


export async function loginController({ email, password }) {
    try {
        const result = await UserService.loginUser({ email, password });
        return { success: true, user: result.user, message: "Login realizado com sucesso!"  };
    } catch (error) {
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
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, message: "Erro inesperado ao buscar usuário logado." };
    }
}

export async function getAllUsersController() {
    try {
        await authAdmin();
        const results = await UserService.getAllUsers();
        return { success: true, users: results.user };
    } catch (error) {
        return { success: false, message: "Erro inesperado ao buscar usuários." };
    }
}