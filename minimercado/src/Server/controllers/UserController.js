'use server'

import { authAdmin } from "@/src/Server/utils/auth";
import {getSupabaseAdmin} from "@/src/lib/supabaseServer"
import * as UserService from "@/src/Server/services/UserService";
import { revalidatePath } from "next/cache";

/**
 * Action para criar um novo usuário (Admin ou Operador)
 * REGRA: Apenas um Admin logado pode executar isso.
 */

export async function loginController({ email, password }) {
    try {
        // 1. Validação básica de campos vazios antes de ir ao Service
        if (!email || !password) {
            return { success: false, message: "Preencha todos os campos." };
        }

        // 2. Chama o Service (O "Cérebro")
        const result = await UserService.loginUser({ email, password });

        // 3. Se o Service retornar um erro (vinda do Supabase ou da nossa lógica)
        if (result.error) {
            return { success: false, message: result.error };
        }

        // 4. Se deu tudo certo
        return { 
            success: true, 
            user: result.user, 
            message: "Login realizado com sucesso!" 
        };

    } catch (error) {
        console.error("Erro no UserController:", error);
        return { 
            success: false, 
            message: "Erro interno no servidor ao tentar logar." 
        };
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

export async function registerUserAction(formData) {
    try {
        // 1. SEGURANÇA: Se não for Admin, o authorizeAdmin joga o erro pro catch
        await authAdmin();

        // 2. EXTRAÇÃO: Pega os dados do formulário
        const data = Object.fromEntries(formData.entries());
        
        // 3. EXECUÇÃO: Chama o Service (que vai usar a Entity e o Model)
        const result = await UserService.createUser({ data: data });

        if (result.error) {
            return { success: false, message: result.error };
        }

        revalidatePath("/admin/users"); // Atualiza a lista de usuários no front
        return { success: true, message: "Usuário criado com sucesso!" };

    } catch (error) {
        // Captura erros de validação da Entity ou falta de permissão do Admin
        return { success: false, message: error.message };
    }
}

/**
 * Action para deletar um usuário
 */
export async function deleteUserAction(id) {
    try {
        await authAdmin(); // Trava de segurança
        
        const result = await UserService.deleteUser(id);
        
        revalidatePath("/admin/users");
        return { success: true, message: "Usuário removido do sistema." };
    } catch (error) {
        return { success: false, message: error.message };
    }
}