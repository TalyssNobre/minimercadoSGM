import { getSupabaseServer } from '@/src/lib/supabaseServer';
import { getCategoryById } from '@/src/Server/services/CategoryService';
import Product from "../entitys/ProductEntity";
import * as ProductModel from "@/src/Server/models/ProductModel";

export const createProduct = async({data, image}) => {
        const supabase = await getSupabaseServer();
        const product = new Product(data)

        if (data.combo && typeof data.combo === 'string') data.combo = JSON.parse(data.combo);

        const productexisting = await ProductModel.findByName(data.name)
        if(productexisting){
            return{ error : "Produto já cadastrado"}
        }
        if (!data.combo) {
            const searchCategoryProduct = await getCategoryById({id: data.category_id});
            if (searchCategoryProduct.error) {
                return { error: "Categoria Inexistente" };
            }
}
        
        let imageUrl = null;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        const MAX_SIZE = 2 * 1024 * 1024;   

        if (!allowedTypes.includes(image.type)) {
        return { error: "Formato de image inválido.Use JPG, PNG ou WebP" };
        }
              
        if (image && image.size > 0 && image.size <= MAX_SIZE) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
            const fileBuffer = await image.arrayBuffer();

            const { error: uploadError } = await supabase.storage.from('produtos').upload(fileName, fileBuffer, {contentType: image.type });
            if (uploadError) return { error: "Erro ao fazer upload da image no Storage." };

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
        
        return { success: true, message: "Produto cadastrado" };
    } catch (error) {
        return { error: "Erro ao criar produto" };
    }
};


export const updateProduct = async ({ id, data, image }) => {
    const supabase = await getSupabaseServer();
    try {
        const productexisting = await ProductModel.getProductById(id);
        if (!productexisting) {
            return { error: "O Produto não existe" };
        }
        const memberNameexisting= await ProductModel.findByName(data.name);
        if(memberNameexisting && String(memberNameexisting.id) !== String(id)){
            throw new Error("Produto já cadastrado")
        } 

        let imageUrl = productexisting.image;

        if (image && image.size > 0) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            const MAX_SIZE = 2 * 1024 * 1024;

            if (!allowedTypes.includes(image.type)) {
                return { error: "Formato de image inválido.Use JPG, PNG ou WebP" };
            }

            if (image.size > MAX_SIZE) {
                return { error: "Imagem incompatível: deve ter no máximo 2MB" };
            }

            const fileExt = image.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('produtos').upload(fileName, image, { contentType: image.type });

            if (uploadError) return { error: "Erro ao atualizar imagem: " + uploadError.message };

            const { data: publicUrlData } = supabase.storage.from('produtos').getPublicUrl(fileName);
            imageUrl = publicUrlData.publicUrl;
        }

        const { image: formImage, ...newData } = data;

        const finalData = { 
            ...productexisting, 
            ...newData, 
            image: imageUrl
        };

        const results = await ProductModel.updateProduct(id, finalData);
        return { success: true, product: results, message: "Produto atualizado com sucesso!" };
        
    } catch (error) {
        return { error: error.message };
    }
};

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
        return{error: "Erro ao buscar produtos"}
    }
}

export const getProductById = async(id) => {
    const productexisting = await ProductModel.getProductById(data.id);
    if(!productexisting){
        return{error :  "O Produto não encontrado"}
    }
     try{
        const results = await ProductModel.getProductById(id);
        return{success : true, product : results}
    }catch(error){
        return{error: "Erro ao buscar produtos"}
    }
}

export const deleteProduct = async(id) =>{
    const productexisting = await ProductModel.getProductById(id);
    if(!productexisting){
        return{error :  "Produto não encontrado"}
    }
    try{
        const results = await ProductModel.deleteProduct(id);
        return{success : true, product : results}
    }catch(error){
        return{error :"Erro ao deletar produto"}
    }
}