import {getSupabaseServer} from "@/src/lib/supabaseServer";
import * as TeamModel from "../models/TeamModel";
import Team from "../entitys/TeamEntity";


export const createTeam = async ({data}) =>{
    const supabase = await getSupabaseServer();

    const teamName = data.name ;
    const {data : teamexisting} = await supabase.from("Team").select("*").eq("name", teamName).maybeSingle();
    if(teamexisting ){
        return{error: "Time já cadastrado"}
    }

    try {
        const teamEntity = new Team(data);
   
        const results = await TeamModel.createTeam(teamEntity);
        return { success: true, team: results };
    } catch (error) {
        return { error: error.message };
    }
}

export const updateTeam = async ({data}) => {
    const supabase = await getSupabaseServer();
    const teamName = data.name;

    const {data : teamexisting} = await supabase.from("Team").select("*").eq("name", teamName).maybeSingle();
    if(!teamexisting ){
        return{error: "Time inexistente"}
    }
    try{
        const teamEntity  = new Team(data);
        const results = await TeamModel.updateTeam(teamEntity);
        return {success: true, team : results}
    }catch(error){
        return { error: error.message };
    }
}


export const getAllTeams = async() => {
    try{
        const results = await TeamModel.getAllTeams();
        return{success : true, team : results}
    } catch(error){
        return{error: error.message}
    }
}

export const getTeamById = async ({id}) => {
    const {data: teamId} = await supabase.from("Team").select("*").eq("id", id).single()
    if(!teamId){
    return{erro: "Usuario não encontrado"};
    }
    try{
        const results = await TeamModel.getTeamById(id);
        return{success : true, team : results}
    }catch(error){
        return{error: error.message}
    }
}

export const deleteTeam = async ({id}) => {
    try{
        const results = await TeamModel.deleteTeam(id);
        return{success : true, team : results}
    }catch(error){
        return{error: error.message}
    }
}
