import { useState, useEffect } from 'react';
import { getAllCategory, createCategory } from '@/src/Server/controllers/CategoryController';

export interface Categoria {
  id: string | number;
  name: string;
}

export function useCategorias(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  useEffect(() => {
    async function carregarDados() {
      const response = await getAllCategory() as any;
      if (response?.success) {
        const listaBruta = response.category || response.data;
        if (Array.isArray(listaBruta)) setCategorias(listaBruta);
      }
    }
    carregarDados();
  }, []);

  const handleSalvarCategoria = async (e: React.FormEvent, callbackSucesso: (id: string) => void) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;

    try {
      const formData = new FormData();
      formData.append('name', novaCategoriaNome);

      const response = await createCategory(formData) as any;

      if (response.success && response.data) {
        setCategorias(prev => [...prev, response.data]);
        setNovaCategoriaNome('');
        setIsModalCategoriaOpen(false);
        callbackSucesso(response.data.id.toString());
        exibirAlerta("Categoria criada com sucesso!", 'success');
      } else {
        exibirAlerta(response.message || "Erro ao criar categoria", 'error');
      }
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      exibirAlerta("Erro de conexão ao criar categoria.", 'error');
    }
  };

  return {
    categorias,
    isModalCategoriaOpen, setIsModalCategoriaOpen,
    novaCategoriaNome, setNovaCategoriaNome,
    handleSalvarCategoria
  };
}