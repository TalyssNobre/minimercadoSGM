import * as TeamModel from "../models/TeamModel";
import Team from "../entitys/TeamEntity";

export const createTeam = async ({data}) =>{

    const teamexisting = await TeamModel.findByName(data.name);
    if(teamexisting ){
        throw new Error("Time já cadastrado")
    }
    try {
        const teamEntity = new Team(data);
   
        const results = await TeamModel.createTeam(teamEntity);
        return { success: true, team: results };
    } catch (error) {
        return { error: "Erro ao criar o time" };
    }
}

export const updateTeam = async ({data,id} ) => {
    const  teamexisting = await TeamModel.getTeamById(data.id)
    if(!teamexisting ){
        throw new Error("Time não cadastrado")
    }
    const memberNameexisting= await TeamModel.findByName(data.name);
    if(memberNameexisting && String(memberNameexisting.id) !== String(id)){
        throw new Error("Time já cadastrado")
    } 
    try{
        const teamEntity  = new Team(data);
        const results = await TeamModel.updateTeam(id ,teamEntity);
        return {success: true, team : results}
    }catch(error){
        return { error: "Erro ao atualizar o time" };
    }
}

export const getAllTeams = async() => {
    try{
        const results = await TeamModel.getAllTeams();
        return{success : true, team : results}
    } catch(error){
        return{error:"Erro ao buscar os times"}
    }
}

export const getTeamById = async (id) => {
    try {
        const results = await TeamModel.getTeamById(id);
        if (!results) {
            throw new Error("Time não encontrado");
        }

        return { success: true, team: results };
    } catch (error) {
        return { error: "Erro ao buscar time" };
    }
}

export const deleteTeam = async (id) => {
    try{
        const results = await TeamModel.deleteTeam(id);
        return{success : true, team : results}
    }catch(error){
        return{error: "Erro ao deletar o time"}
    }
}