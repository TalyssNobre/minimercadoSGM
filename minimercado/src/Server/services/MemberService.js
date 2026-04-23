import {getSupabaseServer} from "@/src/lib/supabaseServer";
import {getTeamById} from "../services/TeamService";
import * as MemberModel from "../models/MemberModel";
import Member from "../entitys/MemberEntity";

export const createMember = async ({data})=> {
    const memberexisting= await MemberModel.findByName(data.name);
    if(memberexisting){
        throw new Error("Membro já cadastrado")
    } 

    const searchTeamById = await getTeamById(data.team_id);
    if(searchTeamById.error){
        throw new Error("Integrante não vinculado a um Time")
    }
    try{
        const memberEntity  = new Member(data);
        const results = await MemberModel.createMember(memberEntity);
        return {success: true, member : results}
    }catch(error){
        return { error: error.message };
    }
}

export const updateMember = async (id, data) => {
    const memberexisting = await MemberModel.getMemberById(data.id)
    if(!memberexisting){
        throw new Error("Membro não encontrado")
    }
    const memberNameexisting= await MemberModel.findByName(data.name);
    if(memberNameexisting){
        throw new Error("Membro já cadastrado")
    } 
    try{
        const memberEntity  = new Member(data)
        const results = await MemberModel.updateMember(id, memberEntity);
        return {success: true, member : results}
    }catch(error){
        return { error: error.message };
    }
}

export const getAllMember = async() => {
     try{
        const results = await MemberModel.getAllMember();
        return{success : true, member : results}
    } catch(error){
        return{error: "Membros não encontrados"}
    }
}

export const getMemberById = async(id) => {
   try{
        const results = await MemberModel.getMemberById(id);
        return{success : true, member : results}
    }catch(error){
        return{error: error.message}
    }
}

export const deleteMember = async(id) => {
    const memberexisting = await MemberModel.getMemberById(id)
    if(!memberexisting){
        throw new Error("Membro não encontrado")
    }
   try{
        const results = await MemberModel.deleteMember(id);
        return{success : true, member : results}
    }catch(error){
        return{error: error.message}
    }
}
