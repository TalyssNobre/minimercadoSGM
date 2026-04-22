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
        
        const mapaDeNomes = new Map();
        const mapaDeEstoque = new Map();
        
        listaProdutos.forEach((p: any) => {
          mapaDeNomes.set(p.id, p.name);
          mapaDeEstoque.set(p.id, Number(p.stock) || 0);
        });

        setProdutos(listaProdutos.map((p: any) => {
          const precoOriginal = Number(p.price) || 0;
          const emPromo = Boolean(p.promo_status);
          const precoPromo = Number(p.promo_price) || 0;
          const precoEfetivo = (emPromo && precoPromo > 0) ? precoPromo : precoOriginal;

          let estoqueFinal = Number(p.stock) || 0;
          let isCombo = false;
          let comboDescription = ''; 

          if (p.combo && p.combo !== 'null' && p.combo !== null) {
            isCombo = true;
            try {
              const comboItens = typeof p.combo === 'string' ? JSON.parse(p.combo) : p.combo;
              
              if (!comboItens || comboItens.length === 0) {
                estoqueFinal = 0;
              } else {
                // 🟢 CORREÇÃO: Dizendo explicitamente que é uma lista de textos (string)
                const descricoes: string[] = []; 
                
                const possibilidades = comboItens.map((item: any) => {
                  const idIngrediente = item.product_id || item.produto_id;
                  const qtdNecessaria = item.quantity || item.qty || 1;
                  const nomeIngrediente = mapaDeNomes.get(idIngrediente) || 'Item';
                  
                  descricoes.push(`${qtdNecessaria}x ${nomeIngrediente}`);
                  
                  const estoqueAtualDoIngrediente = mapaDeEstoque.get(idIngrediente) || 0;
                  return Math.floor(estoqueAtualDoIngrediente / qtdNecessaria);
                });
                
                estoqueFinal = Math.min(...possibilidades);
                comboDescription = descricoes.join(', '); 
              }
            } catch(e) {
              console.error("Erro ao ler JSON do combo", e);
              estoqueFinal = 0;
            }
          }

          return {
            id: p.id,
            name: p.name,
            category: catMap.get(p.category_id) || p.category_name || 'Sem Categoria',
            price: precoEfetivo,
            base_price: precoOriginal,
            promo_status: emPromo,
            image: p.image_url || p.image || null,
            stock: estoqueFinal,
            isCombo: isCombo,
            combo_description: comboDescription 
          };
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do PDV:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const atualizarEstoqueLocal = useCallback((payload: any) => {
    if (payload.eventType === 'UPDATE' && payload.new) {
      setProdutos((prevProdutos) => 
        prevProdutos.map(produto => 
          produto.id === payload.new.id 
            ? { ...produto, stock: Number(payload.new.stock) } 
            : produto
        )
      );
    }
  }, []);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  return { equipes, membros, produtos, categorias, isLoading, atualizarDados: fetchDados, atualizarEstoqueLocal };
}