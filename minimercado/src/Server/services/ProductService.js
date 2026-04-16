import { getSupabaseServer } from '@/src/lib/supabaseServer';
import { getAllCategory, getCategoryById } from '@/src/Server/services/CategoryService';
import Product from "../entitys/ProductEntity";
import * as ProductModel from "@/src/Server/models/ProductModel";

export const createProduct = async({data, image}) => {

        const supabase = await getSupabaseServer();
        const product = new Product(data)
        const productexisting = await ProductModel.findByName(data.name)
        if(productexisting){
            return{ error : "Produto já cadastrado"}
        }
        const searchCategoryProduct = await getCategoryById({id: data.category_id});
        if(searchCategoryProduct.error){
            return{error : "Produto não vinculado a uma Categoria"}
        }
        
        let imageUrl = null;
         //MEXI NO TAMANHO DA IMAGEM E O TIPO
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', '/image/jpg'];
        const MAX_SIZE = 2 * 1024 * 1024;   

        if (!allowedTypes.includes(image.type)) {
        return { error: "Formato de imagem inválido. Use JPG, PNG ou WebP." };
        }
              
       if (image && image.size > 0 || image && image.size < MAX_SIZE) {
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
    const productexisting = await ProductModel.getProductById(data.id);
    if(!productexisting){
        return{error :  "o Produto não existe"}
    }
    let imageUrl = productexisting.image;
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
        const finalData = { ...productexisting,...data, image: imageUrl };
        console.log("OQ TA VINDO NO PRODUCT: ", finalData)
    
        console.log("OQ VAI PRA MODEL: ", finalData)

        const results = await ProductModel.updateProduct(id, finalData);
        return {success: true, product : results, message : "Produto atualizado com sucesso!"}
    }catch(error){
        return { error: error.message };

        
    }
}
export const getAllProducts = async()=> {
    try{
        const results = await ProductModel.getAllProducts();

        const produtosComPromo = results.map(product => { 
            const productEntity = new Product(product)
            return{
                ...product,
                 finalPrice: productEntity.PromoPrice
            };
        })
        return{success: true, product: produtosComPromo}
    }catch(error){
        return{error: error.message}
    }
}

export const getProductById = async(id) => {
    const productexisting = await ProductModel.getProductById(data.id);
    if(!productexisting){
        return{error :  "o Produto não encontrado"}
    }
        try{
            const results = await ProductModel.getProductById(id);
            return{success : true, product : results}
        }catch(error){
            return{error: error.message}
        }
}

export const deleteProduct = async(id) =>{
    const productexisting = await ProductModel.getProductById(id);
    if(!productexisting){
        return{error :  "o Produto não encontrado"}
    }
        try{
            const results = await ProductModel.deleteProduct(id);
            return{success : true, product : results}
        }catch(error){
            return{error : error.message}
        }
}
