'use server'
import { authAdmin } from "@/src/Server/utils/auth";
import { formatText } from "@/src/Server/utils/formatter";
import * as TeamService from "@/src/Server/services/TeamService";
import { revalidatePath } from "next/cache";

export async function createTeam(dataFront) {
    try{
        await authAdmin();
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await TeamService.createTeam({ 
                    data: data,
         });
        if (results.error) return { success: false, message: results.error };
        revalidatePath("/team");
        return { success: true, message: "Time registrado!" };
        
    } catch (error) {
        return { success: false, message: error.message };
     }
} 

export async function updateTeam(dataFront) {
    try{
        await authAdmin();
        const id = dataFront.get("id")
        const data = Object.fromEntries(dataFront.entries());
        if (data.name) {
            data.name = formatText(data.name);
        }
        const results = await TeamService.updateTeam({
            data: data,
            id: id
        });
        if(results.error)return { success: false, message: results.error };
        revalidatePath("/team");
        return { success: true, message: "Time atualizado!" };
        
    } catch (error) {
        return { success: false, message: error.message };
    }   
}

export async function getAllTeams() {
 try{
        const results = await TeamService.getAllTeams() 
    if (!results || results.error) {
            return { success: false, data: [], message: results.error };
        }
        return { success: true, data: results };
    } catch (error) {
        return { success: false, data: [], message: error.message };
    }
}

export async function getTeamById(id) {
    try{
        const results = await TeamService.getTeamById(id)
        if(results.error) return{success : false, message: results.error};
        return { success: true, message: "Time encontrado" };
    }catch (error) {
        return { success: false, message: error.message };
    }   
}

export async function deleteTeam(id) {
    try{
        await authAdmin();
        const results = await TeamService.deleteTeam(id)
        if(results.error) { return{sucess: false, message: results.error}
        }
        revalidatePath("/team");
        
        return { success:true, message: "Time excluido"}
    }catch(error){
        return { success: false, message: error.message };
    }
}