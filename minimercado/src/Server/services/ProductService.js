import { getSupabaseServer } from '@/src/lib/supabaseServer';
import { getAllCategory, getCategoryById } from '@/src/Server/services/CategoryService';
import Product from "../entitys/ProductEntity";
import * as ProductModel from "@/src/Server/models/ProductModel";

export const createProduct = async({data, image}) => {

        const supabase = await getSupabaseServer();
        const product = new Product(data)
        const {data : productexisting, error : searchError} = await supabase.from("Product").select("*").eq("name", data.name).single();
        if(productexisting){
            return{ error : "Produto já cadastrado"}
        }
        const searchCategoryProduct = await getCategoryById({id: data.category_id});
        if(searchCategoryProduct.error){
            return{error : "Produto não vinculado a uma Categoria"}
        }
        
        let imageUrl = null;

       if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const fileBuffer = await image.arrayBuffer();

            const { error: uploadError } = await supabase.storage
            .from('produtos')
            .upload(fileName, fileBuffer, {
                contentType: image.type 
            });
            if (uploadError) return { error: "Erro ao fazer upload da imagem no Storage." };

        const { data: publicUrlData } = supabase.storage.from('produtos').getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
    }

    const finalData = {
    ...data,
    image: imageUrl
}

    try {
        const productEntity = new Product(finalData); 
        const results = await ProductModel.createProduct(productEntity);
        return { 
            success: true, 
            message: "Produto cadastrado com sucesso!" 
        };
    } catch (error) {
        return { error: error.message };
    }
};


export const updateProduct = async ({id, data, imagem }) => {
    const supabase = await getSupabaseServer();
try{
    const memberId = data.id;
    const {data : productexisting} = await supabase.from("Product").select("*").eq("id", memberId).single();
    if(!productexisting){
        return{error :  "o Membro não existe"}
    }
    let imageUrl = productCurrent.image;
    if (imagem && imagem.size > 0) {
            const fileExt = imagem.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('produtos')
                .upload(fileName, imagem);

            if (uploadError) return { error: "Erro ao atualizar imagem: " + uploadError.message };

            const { data: publicUrlData } = supabase.storage
                .from('produtos')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        // 3. Valida os novos dados com a Entity
        const finalData = { ...data, image: imageUrl };
        const productEntity = new Product(finalData);

        const results = await ProductModel.updateProduct(id, productEntity);
        return {success: true, product : results, message : "Produto atualizado com sucesso!"}
    }catch(error){
        return { error: error.message };
    }
}


