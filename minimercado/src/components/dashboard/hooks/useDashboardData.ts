import { useState, useEffect } from 'react';
// 🟢 Importamos a nova rota do Dashboard e as rotas normais
import { dashboardStatus } from '@/src/Server/controllers/DashboardController'; 
import { getAllProducts } from '@/src/Server/controllers/ProductController';
import { getStatsForProduct } from '@/src/Server/controllers/SaleController'; 
import { Category, Product } from '../types';

export function useDashboardData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🟢 Preparamos os estados já no formato que o backend vai devolver
  const [metricas, setMetricas] = useState({
  totaisGerais: { totalVendido: 0, totalRecebido: 0, totalAReceber: 0, totalDescontos: 0 }, // 🟢 Inicializado
  totaisPorCategoria: {} as Record<number, number>,
  curvaABC: [] as any[]
});

  useEffect(() => {
    async function carregarDashboard() {
      setIsLoading(true);
      try {
        // 🟢 O celular do usuário agora só pede os dados, não calcula mais NADA!
        const [dashRes, prodRes] = await Promise.all([
          dashboardStatus() as any,
          getAllProducts() as any
        ]);

        // Carrega os produtos para usar nos selects e outras telas
        if (prodRes?.success) {
          setProducts(prodRes.data || []);
        }

        // 🟢 Se o backend devolver sucesso, nós apenas preenchemos as caixinhas na tela
        if (dashRes?.success && dashRes.data) {
          setCategories(dashRes.data.categories || []);
          
          setMetricas({
            totaisGerais: dashRes.data.totaisGerais || { totalVendido: 0, totalRecebido: 0, totalAReceber: 0 },
            totaisPorCategoria: dashRes.data.totaisPorCategoria || {},
            curvaABC: dashRes.data.curvaABC || [] // 👈 Recebendo a Curva ABC limpinha do backend
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    carregarDashboard();
  }, []);

  // 🟢 A função da Estatística de Produtos continua igual (ela já era perfeita)
  const fetchProductStats = async (productId: number | string) => {
    if (!productId) return null;
    try {
      const response = await getStatsForProduct(productId) as any;
      if (response?.success) return response.data; 
    } catch (error) {
      console.error("Erro ao buscar estatísticas do produto:", error);
    }
    return null;
  };

  return { 
    categories, 
    products, 
    isLoading, 
    fetchProductStats, 
    ...metricas 
  };
}