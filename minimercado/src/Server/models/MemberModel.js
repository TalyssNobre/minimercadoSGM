
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
<<<<<<< HEAD
=======
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllMember = async() => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").select("*").order("name", { ascending: true });
>>>>>>> c5dc8ace440e2dd2e6bc16856145050e6c4ed5ce
   if(error){ throw new Error(error.message);
    } return data;
}

export const getAllMember = async() => {
    const supabase = await getSupabaseServer();
    const results = await supabase.from("member").select("*").order("name", { ascending: true })
}

export const getMemberById = async(id) => {
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").select("*").eq("id", id).single();
   if(error){ throw new Error(error.message);
    } return data;
}


export const deleteMember = async(id) =>{
    const supabase = await getSupabaseServer();

    const{data,error} = await supabase.from("member").delete().eq("id", id).select().single()
       if(error){ throw new Error(error.message);
    } return data;
}
