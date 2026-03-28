
import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createTeam = async(teamEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Team").insert(teamEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateTeam = async(id, teamEntity) => {
   const supabase = await getSupabaseServer();

   const{data,error} = await supabase.from("Team").update(teamEntity).eq("id", id).select().single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllTeams = async() => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Team").select('id, name, color, member(count)') // 🟢 TEM QUE TER ESSE member(count)
   .order('name', { ascending: true });
   if(error){ throw new Error(error.message);
    } return data;
}

export const getTeamById = async(id) => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Team").select("*").eq("id", id).maybeSingle();
   if(error){ throw new Error(error.message);
    } return data;
}


export const deleteTeam = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Team").delete().eq("id", id).select().single()
       if(error){ throw new Error(error.message);
    } return data;
}


