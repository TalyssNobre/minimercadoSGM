import { useState, useEffect, useCallback } from 'react';
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';
import { getAllCategory } from '@/src/Server/controllers/CategoryController';
import { getAllProducts } from '@/src/Server/controllers/ProductController';
import { Equipe, Membro, Produto } from '../types';

export function usePDVDados() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<string[]>(['Todos']);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamsResp, membersResp, categoriesResp, productsResp] = await Promise.all([
        getAllTeams() as any,
        getAllMember() as any,
        getAllCategory() as any,
        getAllProducts() as any
      ]);

      const catMap = new Map();
      if (categoriesResp?.success) {
        const listaCat = categoriesResp.data || categoriesResp.category || [];
        setCategorias(['Todos', ...listaCat.map((c: any) => c.name)]);
        listaCat.forEach((c: any) => catMap.set(c.id, c.name));
      }

      if (teamsResp?.success) setEquipes(teamsResp.data || teamsResp.team || []);
      if (membersResp?.success) setMembros(membersResp.data || membersResp.member || []);

      if (productsResp?.success) {
        const listaProdutos = productsResp.data || productsResp.product || [];
        setProdutos(listaProdutos.map((p: any) => {
          // 🟢 Lógica da Promoção
          const precoOriginal = Number(p.price) || 0;
          const emPromo = Boolean(p.promo_status);
          const precoPromo = Number(p.promo_price) || 0;
          
          // Se estiver em promo, o preço oficial vira o da promo
          const precoEfetivo = (emPromo && precoPromo > 0) ? precoPromo : precoOriginal;

          return {
            id: p.id,
            name: p.name,
            category: catMap.get(p.category_id) || p.category_name || 'Sem Categoria',
            price: precoEfetivo, // 👈 O Carrinho vai ler esse!
            base_price: precoOriginal, // 👈 Guardamos o original para as contas
            promo_status: emPromo,
            image: p.image_url || p.image || null,
            stock: Number(p.stock) || 0
          };
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do PDV:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { equipes, membros, produtos, categorias, isLoading, atualizarDados: fetchDados };
}