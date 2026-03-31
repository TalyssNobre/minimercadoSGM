"use server"
import { authAdmin } from "@/src/Server/utils/auth";
import { formatText } from "@/src/Server/utils/formatter";
import * as MemberService from "@/src/Server/services/MemberService"
import { revalidatePath } from "next/cache";
import { getSupabaseServer, getSupabaseAdmin } from "@/src/lib/supabaseServer";

export async function createMember(dataFront) {
    try{
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const supabase = getSupabaseAdmin();
        const results = await MemberService.createMember(supabase,{
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
        const supabase = getSupabaseAdmin();
        const results = await MemberService.updateMember(supabase,{
            data: data
        });
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/membro");
        return { success: true, message: "Membro cadastrado!" };
    }catch(error){
        return { success: false, message: error.message };
    }
}

export async function getAllMember() {
    try{
    const supabase = await getSupabaseServer();
    const results = await MemberService.getAllMember(supabase);
    if (!results || results.error) {
        return { success: false, message: results.error };
    }
    return { success: true,data: results.team, data: results.member };
    }catch (error) {
        return { success: false, message: error.message };
    }
}

export async function getMemberById(id) {
    try{
        const supabase = await getSupabaseServer();
        const results = await MemberService.getMemberById(supabase, id);
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/membro");
        return { success: true, data: results.member };
    }catch(error){
        return { success: false, message: error.message };
    }
}

export async function deleteMember(id) {
    try{
        await authAdmin();
        const supabase = getSupabaseAdmin();
        const results = await MemberService.deleteMember(supabase, id);
        if(results.error) { return{sucess: false, message: results.error}
        }

        revalidatePath("/membro");
        return { success:true, message: "Membro excluido"}
    }catch(error){
        return { success: false, message: error.message  };
    }
    
}