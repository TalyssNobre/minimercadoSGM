import {getSupabaseServer} from "@/src/lib/supabaseServer";
import {getTeamById} from "../services/TeamService";
import * as MemberModel from "../models/MemberModel";
import Member from "../entitys/MemberEntity";

export const createMember = async ({data})=> {
    const supabase = await getSupabaseServer();

    const member = data.name;
    const {data: memberexisting} = await supabase.from("Member").select("*").eq("name", member).single();
    if(memberexisting){
        return{error : "Membro já cadastrado"}
    } 

    const searchTeamById = await getTeamById({ data: { id: data.team_id } });
    if(searchTeamById.error){
        return{error : "Integrante não vinculado a um Time"}
    }
    try{
        const memberEntity  = new Member(data);
        const results = await MemberModel.createMember(memberEntity);
        return {success: true, member : results}
    }catch(error){
        return { error: error.message };
    }
}

export const updateMember = async ({data}) => {
    const supabase = await getSupabaseServer();

    const memberId = data.id;
    const {data : memberexisting} = await supabase.from("Member").select("*").eq("id", memberId).single();
    if(!memberexisting){
        return{error :  "o Membro não existe"}
    }
    try{
        const memberEntity  = new Member(data)
        const results = await TeamModel.updateMember(memberEntity);
        return {success: true, member : results}
    }catch(error){
        return { error: error.message };
    }
}

export const getAllMember = async() => {
    const supabase = await getSupabaseServer();
     try{
        const results = await MemberModel.getAllMember();
        return{success : true, member : results}
    } catch(error){
        return{error: error.message}
    }
}

export const getMemberById = async({id}) => {
    const supabase = await getSupabaseServer();
    const {data: memberId} = await supabase.from("Member").select("*").eq("id", id).single()
    if(!memberId){
    return{erro: "Usuario não encontrado"};
    }
   try{
        const results = await MemberModel.getMemberById(id);
        return{success : true, member : results}
    }catch(error){
        return{error: error.message}
    }
}

export const deleteMember = async({data}) => {
    const supabase = await getSupabaseServer();

    const memberId = data.id
    const {error} = await supabase.from("Member").delete().eq("id", memberId).single();
    if(error){
        return {success: false, error: error.message}
    }
    return { sucess: true}
}