import { getSupabaseServer } from '@/src/lib/supabaseServer';
import { getAllCategory, getCategoryById } from '@/src/Server/services/CategoryService';
import Product from "../entitys/ProductEntity";
import * as ProductModel from "@/src/Server/models/ProductModel";

export const createProduct = async({data, imagem}) => {

        const supabase = await getSupabaseServer();
        const product = new Product(data)
        const {data : productexisting, error : searchError} = await supabase.from("Product").select("*").eq("name", data.name).single();
        if(productexisting){
            return{ error : "Produto já cadastrado"}
        }
        const searchCategoryProduct = await getCategoryById({id: data.category});
        if(searchCategoryProduct.error){
            return{error : "Produto não vinculado a uma Categoria"}
        }
        
        let imageUrl = null;

        // 2. Faz o upload da imagem se ela foi enviada
       if (imagem && imagem.size > 0) {
            const fileExt = imagem.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('produtos')
                .upload(fileName, imagem);

            if (uploadError) return { error: "Erro ao fazer upload da imagem no Storage." };

        const { data: publicUrlData } = supabase.storage
            .from('produtos')
            .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
    }

    // 4. Montagem do objeto final (Garante que funcione com ou sem imagem)
    const finalData = { 
        ...data, 
        imagem: imageUrl 
    };

    // 5. Instancia a Entity e chama o Model
    try {
        const productEntity = new Product(finalData); // A Entity valida os dados aqui
        return await ProductModel.createProduct(productEntity);
    } catch (error) {
        // Se a Entity barrar algo (falta de preço, nome, etc), cai aqui
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
            
            // Opcional: Aqui você poderia deletar a imagem ANTIGA do Storage para não encher o banco
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
/*export const updateProduct = async ({ id, data, imagem }) => {
    const supabase = await getSupabaseServer();

    try {

         // Mantém a imagem atual por padrão

        // 2. Se uma NOVA imagem foi enviada, faz o upload
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
            
            // Opcional: Aqui você poderia deletar a imagem ANTIGA do Storage para não encher o banco
        }

        // 3. Valida os novos dados com a Entity
        const finalData = { ...data, image: imageUrl };
        const productEntity = new Product(finalData);

        // 4. Chama o Model para atualizar
        const result = await ProductModel.updateProduct(id, productEntity);
        
        return { success: true, data: result, message: "Produto atualizado com sucesso!" };

    } catch (error) {
        return { error: error.message };
    }
};*/

export const getAllProducts =  async() =>{
    try{
        const results = await ProductModel.getAllProducts();
        return { success: true, data: results };
    }catch(error){
        return { error: error.message };
    }
}



export const getProductById = async ({id}) => {
    const supabase = await getSupabaseServer();
    const data = await ProductModel.getProductById(id);
    if(!data) return { error: "Produto não encontrado" };
    return data;
}

export const deleteProduct = async({id}) => {
    const supabase = await getSupabaseServer();
    const data = await ProductModel.deleteProduct(id);
    if(!data) return { error: "Produto não encontrado" };
    return data;
}

/*'use server'

import { getSupabaseServer } from '@/src/lib/supabaseServer';

// =========================================================================
// 1. BUSCAR CATEGORIAS
// =========================================================================
export const getCategorias = async () => {
    try {
        const supabase = await getSupabaseServer();
        const { data, error } = await supabase.from('Category').select('id, name');
        
        if (error) return { error: "Erro ao buscar categorias." };
        return { sucesso: true, data };
    } catch (err) {
        return { error: "Erro interno do servidor." };
    }
};

// =========================================================================
// 2. CRIAR NOVA CATEGORIA
// =========================================================================
export const createCategoria = async (nome) => {
    try {
        const supabase = await getSupabaseServer();
        const idGerado = Date.now(); // Mantendo a tua lógica de ID manual
        
        const { data, error } = await supabase
            .from('Category')
            .insert([{ id: idGerado, name: nome }])
            .select()
            .single();

        if (error) return { error: "Erro ao criar categoria." };
        return { sucesso: true, data };
    } catch (err) {
        return { error: "Erro interno do servidor." };
    }
};

// =========================================================================
// 3. CRIAR PRODUTO E UPLOAD DE IMAGEM
// =========================================================================
export const createProduct = async (formData) => {
    try {
        const supabase = await getSupabaseServer();
        
        // Extraindo dados do FormData
        const nome = formData.get('nome');
        const categoriaId = formData.get('categoriaId');
        const preco = formData.get('preco');
        const estoque = formData.get('estoque');
        const imagem = formData.get('imagem'); // Recebe o File enviado do front

        // 1. Verifica se o produto já existe
        const { data: productexisting } = await supabase
            .from("Product")
            .select("*")
            .eq("name", nome)
            .single();
            
        if (productexisting) {
            return { error: "Produto já cadastrado." };
        }

        let imageUrlSalvaNoBanco = null;

        // 2. Faz o upload da imagem se ela foi enviada
        if (imagem && imagem.size > 0) {
            const fileExt = imagem.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('produtos')
                .upload(fileName, imagem);

            if (uploadError) return { error: "Erro ao fazer upload da imagem no Storage." };

            const { data: publicUrlData } = supabase.storage
                .from('produtos')
                .getPublicUrl(fileName);

            imageUrlSalvaNoBanco = publicUrlData.publicUrl;
        }

        const idProdutoGerado = Date.now();

        // 3. Monta o objeto final e salva no banco
        const novoProduto = {
            id: idProdutoGerado,
            name: nome,
            category_id: parseInt(categoriaId),
            price: parseFloat(preco),
            stock: parseInt(estoque) || 0,
            image: imageUrlSalvaNoBanco
        };

        const { data: newproduct, error: insertError } = await supabase
            .from("Product")
            .insert([novoProduto])
            .select()
            .single();
            
        if (insertError) {
            return { error: "Erro ao salvar o produto no banco de dados." };
        }
        
        return { sucesso: true, produto: newproduct };

    } catch (err) {
        console.error("Erro inesperado em createProduct:", err);
        return { error: "Ocorreu um erro interno inesperado no servidor." };
    }
};*/