"user server"
import { authAdmin } from "@/src/Server/utils/auth";
import { formatText } from "@/src/Server/utils/formatter";
import * as MemberService from "@/src/Server/services/MemberService"
import { revalidatePath } from "next/cache";

export async function createMember(dataFront) {
    try{
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await MemberService.createMember({
        data: data 
        });
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/membro");
        return { success: true, message: "Membro cadastrada!" };
    }catch(error){
        return { success: false, message: error.message };
    }
}

export async function updateMember(dataFront) {
    try{
        await authAdmin();
        const data  = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await MemberService.updateMember({
            data: data
        });
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/membro");
        return { success: true, message: "Membro cadastrada!" };
    }catch(error){
        return { success: false, message: error.message };
    }
}

export async function getAllMember() {
    try{
    const results = await MemberService.getAllMember();
    if (!results || results.error) {
        return { success: false, data: [], message: results.error };
    }
    return { success: true, data: results };
    }catch (error) {
        return { success: false, data: [], message: error.message };
    }
}

export async function getMemberById(id) {
    try{
        const results = await MemberService.getMemberById(id);
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/membro");
        return { success: true, message: "Membro encontrado!" };
    }catch(error){
        return { success: false, message: error.message };
    }
}

export async function deleteMember(id) {
    try{
        await authAdmin();
        const results = await MemberService.deleteMember(id);
        if(results.error) { return{sucess: false, message: results.error}
        }

        revalidatePath("/membro");
        return { success:true, message: "Membro excluido"}
    }catch(error){
        return { success: false, message: error.message  };
    }
    
}