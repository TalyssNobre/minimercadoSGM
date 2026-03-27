'use server'
import {getSupabaseServer} from "@/src/lib/supabaseServer";
import {getTeamById} from "@/src/actions/TeamActions"

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

    const {data: newMember} = await supabase.from("Member").insert([data]).select().single();
    return{success: true, memberNew: newMember}
}

export const getAllMember = async() => {
    const supabase = await getSupabaseServer();

    const {data} = await supabase.from("Member").select("*");
    return {sucess : true, members: data}
}

export const getMemberById = async({data}) => {
    const supabase = await getSupabaseServer();
    const {data: memberId} = await supabase.from("Member").select("*").eq("id", data.id).single();
    if(!memberId){
        return{error: "Membro não cadastrado"}
    } return{sucess: true, memberById: memberId}
}
export const updateMember = async ({data}) => {
    const supabase = await getSupabaseServer();

    const memberId = data.id;
    const newMember = data.name;
    const {data : memberexisting} = await supabase.from("Member").select("*").eq("id", memberId).single();
    if(!memberexisting){
        return{error :  "o Membro não existe"}
    }
    const {data: dataUpdate} = await supabase.from("Member").update({name : newMember}).eq("id", memberId).select();
    return { sucess : true, memberUpdate : dataUpdate}
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