
import { getSupabaseServer } from '@/src/lib/supabaseServer';

export const createMember = async(memberEntity) => {
    const supabase = await getSupabaseServer();
    const {data, error} = await supabase.from("member").insert(memberEntity).select().single();
    if(error){
        throw new Error(error.message);
    } return data;
}

export const updateMember = async(id, memberEntity) => {
   const supabase = await getSupabaseServer();

   const{data,error} = await supabase.from("member").update(memberEntity).eq("id", id).select().single();
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllMember = async() => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").select("*").order("name", { ascending: true });
   if(error){ throw new Error(error.message);
    } return data;
}



export const getMemberById = async(id) => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").select("*").eq("id", id).maybeSingle();
   if(error){ throw new Error(error.message);
    } return data;
}


export const deleteMember = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").delete().eq("id", id).select().maybeSingle()
       if(error){ throw new Error(error.message);
    } return data;
}
