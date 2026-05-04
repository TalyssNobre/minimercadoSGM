import { useState, useEffect, useMemo } from 'react';
import { getAllCategory } from '@/src/Server/controllers/CategoryController';
import { getAllProducts } from '@/src/Server/controllers/ProductController';
import { getAllSales } from '@/src/Server/controllers/SaleController'; 
import { Category, Product, Sale, HistoricoLinha } from '../types';

export function useHistoricoCategoria() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  useEffect(() => {
    async function carregarDados() {
      setIsLoading(true);
      try {
        const [catRes, prodRes, salesRes] = await Promise.all([
          getAllCategory() as any,
          getAllProducts() as any,
          getAllSales() as any
        ]);

        if (catRes?.success) setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        if (prodRes?.success) setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);

        if (salesRes?.success) {
          const rawSales = Array.isArray(salesRes.data) ? salesRes.data : [];
          const vendasMapeadas: Sale[] = rawSales.map((venda: any) => ({
            sale_id: venda.id || venda.sale_id,
            date: formatDate(venda.date),
            operator_name: venda.user?.name || venda.User?.name || venda.operator_name || 'Sistema', 
            client_name: venda.member?.name || venda.Member?.name || venda.client_name || 'Avulso', 
            
            // 🟢 CORREÇÃO AQUI: Venda entra como ATIVA. O "venda.status" serve apenas para PAGO/FIADO!
            status: 'ATIVA', 
            payment_status: venda.status ? 'PAGO' : 'FIADO',
            
            discount: Number(venda.discount) || 0,
            items: (venda.Item_sale || venda.item_sale || venda.items || []).map((item: any) => ({
              product_id: item.product_id,
              qty: item.quantity || item.qty,
              price: item.unit_price || item.price,
              item_discount: Number(item.item_discount) || 0 
            }))
          }));
          setSales(vendasMapeadas);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      } finally {
        setIsLoading(false);
      }
    }
    carregarDados();
  }, []);

  const historicoDesmembrado = useMemo(() => {
    const historico: HistoricoLinha[] = []; 
    const vendasValidas = sales.filter(s => s.status !== 'CANCELADA');

    vendasValidas.forEach(venda => {
      const descontoExtraVenda = venda.discount || 0;

      venda.items.forEach(item => {
        const produto = products.find(p => p.id === item.product_id);
        
        if (produto) {
          const valorItemBruto = item.qty * item.price;
          const descontoDesteItem = item.item_discount || 0;
          let valorItemLiquido = valorItemBruto - descontoDesteItem;

          if (descontoExtraVenda > 0) {
              const valorBrutoVendaToda = venda.items.reduce((acc, i) => acc + (i.qty * i.price), 0);
              const proporcao = valorItemBruto / valorBrutoVendaToda;
              valorItemLiquido -= (descontoExtraVenda * proporcao);
          }

          valorItemLiquido = Math.max(0, valorItemLiquido); 

          historico.push({
            id_unico: `${venda.sale_id}-${produto.id}`,
            data: venda.date,
            operador: venda.operator_name,
            cliente: venda.client_name,
            produto_nome: produto.name,
            categoria_id: produto.category_id,
            qty: item.qty,
            pagamento: venda.payment_status, // 🟢 FIADO e PAGO aparecerão corretos agora!
            valor_total: valorItemBruto,
            item_discount: descontoDesteItem, 
            valor_liquido: valorItemLiquido
          });
        }
      });
    });

    return historico.reverse();
  }, [products, sales]);

  return { categories, historicoDesmembrado, isLoading };
}