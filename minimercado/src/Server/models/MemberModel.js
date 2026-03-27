
import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createMember = async(memberEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("Member").insert(memberEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateMember = async(id, memberEntity) => {
   const supabase = await getSupabaseServer();

   const{data,error} = await supabase.from("Member").update(memberEntity).eq("id", id).select().single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const getMemberById = async(id) => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Member").select("*").eq("id", id).single();
   if(error){ throw new Error(error.message);
    } return data;
}


export const deleteMember = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("Member").delete().eq("id", id).select().single()
       if(error){ throw new Error(error.message);
    } return data;
}
