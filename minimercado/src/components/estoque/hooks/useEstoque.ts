import { useState, useEffect, useCallback, useRef } from 'react'; 
import { getAllProducts, updateProduct, deleteProduct } from '@/src/Server/controllers/ProductController';
import { getAllCategory } from '@/src/Server/controllers/CategoryController'; 
import { Produto, Categoria } from '../types';

export function useEstoque(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const alertaRef = useRef(exibirAlerta);
  useEffect(() => {
    alertaRef.current = exibirAlerta;
  }, [exibirAlerta]);

  const carregarDados = useCallback(async () => {
    try {
      let listaCategorias: Categoria[] = [];
      const catResponse = await getAllCategory() as any;
      
      if (catResponse?.success) {
        const catData = catResponse.data || catResponse.category || catResponse;
        if (Array.isArray(catData)) listaCategorias = catData;
        setCategorias(listaCategorias);
      }

      const prodResponse = await getAllProducts() as any;
      
      if (prodResponse?.success) {
        let listaProdutos: any[] = [];
        const prodData = prodResponse.data || prodResponse.product || prodResponse;

        if (Array.isArray(prodData)) listaProdutos = prodData;
        else if (prodData?.product && Array.isArray(prodData.product)) listaProdutos = prodData.product;
        else if (prodData?.data && Array.isArray(prodData.data)) listaProdutos = prodData.data;

        const produtosFormatados = listaProdutos.map((item: any) => {
          const categoriaEncontrada = listaCategorias.find(c => c.id === item.category_id);
          return {
            id: item.id,
            name: item.name || 'Produto sem nome',
            category_id: item.category_id,
            price: Number(item.price) || 0,
            stock: Number(item.stock) || 0,
            category_name: categoriaEncontrada?.name || 'Sem Categoria',
            image: item.image_url || item.image || null
          };
        });
        
        setProdutos(produtosFormatados);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // 🟢 NOVA FUNÇÃO: Radar que atualiza só o número do estoque em tempo real!
  const atualizarEstoqueLocal = useCallback((payload: any) => {
    if (payload.new && payload.new.id) {
      setProdutos(prevProdutos => prevProdutos.map(produto => {
        if (produto.id === payload.new.id) {
          // Mantém tudo do produto, só atualiza o estoque com o número novo do banco
          return { ...produto, stock: Number(payload.new.stock) || 0 };
        }
        return produto;
      }));
    }
  }, []);

  const salvarEdicao = async (produtoEditado: Produto, imageFile?: File | null) => {
    try {
      const formData = new FormData();
      formData.append('id', String(produtoEditado.id));
      formData.append('name', produtoEditado.name);
      formData.append('category_id', String(produtoEditado.category_id || ''));
      formData.append('price', String(produtoEditado.price || 0));
      formData.append('stock', String(produtoEditado.stock || 0));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await updateProduct(formData) as any;

      if (!response?.success && !(response as any)?.sucess) {
        alertaRef.current("Erro ao atualizar: " + (response?.message || "Desconhecido"), 'error');
        return false;
      }

      await carregarDados(); 
      alertaRef.current("Produto atualizado com sucesso!", 'success');
      return true;
    } catch (error) {
      alertaRef.current("Erro ao atualizar o produto.", 'error');
      return false;
    }
  };

  const excluirProduto = async (id: number) => {
    try {
      const response = await deleteProduct(id) as any;
      if (response?.success === false || (response as any)?.sucess === false) {
        alertaRef.current("Erro ao excluir: " + response?.message, 'error');
        return false;
      }

      await carregarDados();
      alertaRef.current("Produto excluído com sucesso!", 'success');
      return true;
    } catch (error) {
      alertaRef.current("Erro técnico ao excluir o produto.", 'error');
      return false;
    }
  };

  // 🟢 Não esqueça de exportar a nova função aqui no final!
  return { 
    produtos, 
    categorias, 
    isLoading, 
    salvarEdicao, 
    excluirProduto, 
    atualizarDados: carregarDados,
    atualizarEstoqueLocal 
  };
}