import { useState, useEffect } from 'react';
import { getAllCategory, createCategory, updateCategory, deleteCategory } from '@/src/Server/controllers/CategoryController';

export interface Categoria {
  id: string | number;
  name: string;
}

export function useCategorias(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalCategoriaOpen, setIsModalCategoriaOpen] = useState(false);
  const [novaCategoriaNome, setNovaCategoriaNome] = useState('');

  const [editandoId, setEditandoId] = useState<string | number | null>(null);
  const [editandoNome, setEditandoNome] = useState('');

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

  const handleSalvarCategoria = async (e: React.FormEvent, callbackSucesso?: (id: string) => void) => {
    e.preventDefault();
    if (!novaCategoriaNome.trim()) return;

    try {
      const formData = new FormData();
      formData.append('name', novaCategoriaNome);

      const response = await createCategory(formData) as any;

      if (response.success && response.data) {
        setCategorias(prev => [...prev, response.data]);
        setNovaCategoriaNome('');
        if (callbackSucesso) callbackSucesso(response.data.id.toString());
        exibirAlerta("Categoria criada com sucesso!", 'success');
      } else {
        exibirAlerta(response.message || "Erro ao criar categoria", 'error');
      }
    } catch (error) {
      exibirAlerta("Erro de conexão ao criar categoria.", 'error');
    }
  };

  const handleExcluirCategoria = async (id: string | number) => {
    try {
      const response = await deleteCategory(id) as any;
      if (response?.success || response?.sucess) { 
        // 🟢 CORREÇÃO: Forçamos conversão para String! Agora a lixeira funciona na tela na mesma hora.
        setCategorias(prev => prev.filter(c => String(c.id) !== String(id)));
        exibirAlerta("Categoria excluída com sucesso!", 'success');
      } else {
        exibirAlerta(response.message || "Erro ao excluir categoria.", 'error');
      }
    } catch (error) {
      exibirAlerta("Erro de conexão ao excluir.", 'error');
    }
  };

  const handleAtualizarCategoria = async (id: string | number) => {
    if (!editandoNome.trim()) return exibirAlerta("O nome não pode ser vazio.", 'error');
    try {
      const formData = new FormData();
      formData.append('id', id.toString());
      formData.append('name', editandoNome);

      const response = await updateCategory(formData) as any;
      if (response?.success) {
        // 🟢 CORREÇÃO: Conversão para String no ID para que a tela mude a palavra digitada na hora!
        setCategorias(prev => prev.map(c => String(c.id) === String(id) ? { ...c, name: editandoNome } : c));
        setEditandoId(null);
        setEditandoNome('');
        exibirAlerta("Categoria atualizada com sucesso!", 'success');
      } else {
        exibirAlerta(response.message || "Erro ao atualizar categoria.", 'error');
      }
    } catch (error) {
      exibirAlerta("Erro de conexão ao atualizar.", 'error');
    }
  };

  const iniciarEdicao = (cat: Categoria) => {
    setEditandoId(cat.id);
    setEditandoNome(cat.name);
  };

  return {
    categorias,
    isModalCategoriaOpen, setIsModalCategoriaOpen,
    novaCategoriaNome, setNovaCategoriaNome,
    handleSalvarCategoria,
    handleExcluirCategoria,
    handleAtualizarCategoria,
    editandoId, setEditandoId,
    editandoNome, setEditandoNome,
    iniciarEdicao
  };
}