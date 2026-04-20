import { useState, useEffect, useMemo } from 'react';
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';
import { fetchMemberStatement, settleMultipleSales } from '@/src/Server/controllers/SaleController'; 
import { Equipe, Membro, ItemAgrupado } from '../types';

export function useExtratos(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [historicoBruto, setHistoricoBruto] = useState<ItemAgrupado[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Equipe | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`; 
  };

  useEffect(() => {
    async function fetchDados() {
      try {
        const [teamsResp, membersResp] = await Promise.all([
          getAllTeams() as any,
          getAllMember() as any
        ]);
        if (teamsResp?.success) setEquipes(teamsResp.data || teamsResp.team || []);
        if (membersResp?.success) setMembros(membersResp.data || membersResp.member || []);
      } catch (error) {
        exibirAlerta("Erro ao carregar as equipes e membros.", "error");
      }
    }
    fetchDados();
  }, []);

  useEffect(() => {
    async function loadExtrato() {
      if (!selectedMember) return;
      
      setIsLoadingHistorico(true);
      setHistoricoBruto([]); 
      
      try {
        const res = await fetchMemberStatement(selectedMember.id) as any;
        if (res.success) {
          const todasVendas = [...(res.pending || []), ...(res.paid || [])];
          
          // 🟢 Transforma as vendas no padrão do Histórico
          const formatado: ItemAgrupado[] = todasVendas.map((venda: any) => {
            const desconto = Number(venda.discount) || 0;
            const bruto = Number(venda.total_value) || 0;
            const liquido = Math.max(0, bruto - desconto);
            
            // Junta o nome dos produtos igual no "Meu Histórico"
            const itensString = venda.Item_sale?.map((i: any) => `${i.quantity}x ${i.Product?.name}`).join(', ') || 'Produtos Diversos';

            return {
              id_agrupado: venda.id.toString(), // Usamos o ID da venda como chave do Checkbox
              sale_id: venda.id,
              date: formatDate(venda.date),
              items_resumo: itensString,
              valor_bruto: bruto,
              desconto: desconto,
              valor_liquido: liquido,
              status: venda.status ? 'PAGO' : 'PENDENTE'
            };
          });
          
          setHistoricoBruto(formatado);
        }
      } catch (error) {
        exibirAlerta("Erro de conexão ao carregar o histórico.", "error");
      } finally {
        setIsLoadingHistorico(false);
      }
    }
    loadExtrato();
  }, [selectedMember]);

  // 🟢 Não precisamos mais "remontar" os dados. Só filtramos pela aba!
  const comprasVisiveisAgrupadas = useMemo(() => {
    if (!selectedMember) return [];
    return historicoBruto.filter(item => item.status === activeTab);
  }, [selectedMember, activeTab, historicoBruto]);

  const totais = useMemo(() => {
    if (!selectedMember) return { pago: 0, pendente: 0, selecionado: 0, descontos: 0 };
    
    // 🟢 Tudo calculado com base no Valor Líquido agora!
    const pago = historicoBruto.filter(i => i.status === 'PAGO').reduce((a, c) => a + c.valor_liquido, 0);
    const pendente = historicoBruto.filter(i => i.status === 'PENDENTE').reduce((a, c) => a + c.valor_liquido, 0);
    const selecionado = comprasVisiveisAgrupadas.filter(i => selectedItems.includes(i.id_agrupado)).reduce((a, c) => a + c.valor_liquido, 0);
    
    // 🟢 Novo totalizador de descontos
    const descontos = historicoBruto.filter(i => i.status === 'PENDENTE').reduce((a, c) => a + c.desconto, 0);

    return { pago, pendente, selecionado, descontos };
  }, [selectedMember, comprasVisiveisAgrupadas, selectedItems, historicoBruto]);

  const handleQuitarPendencia = async () => {
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    
    try {
      // 🟢 Como o id_agrupado agora É o ID da venda, é só repassar direto!
      const saleIds = selectedItems.map(Number);
      const res = await settleMultipleSales(saleIds);
      
      if (res.success) {
        exibirAlerta(`Baixa realizada com sucesso!`, 'success');
        setSelectedItems([]); 
        setHistoricoBruto(prev => prev.map(item => saleIds.includes(item.sale_id) ? { ...item, status: 'PAGO' } : item));
      } else {
        exibirAlerta("Erro ao realizar baixa: " + res.message, 'error');
      }
    } catch (error) {
      exibirAlerta("Erro inesperado ao conectar com o servidor.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    equipes, membros,
    selectedTeam, setSelectedTeam,
    selectedMember, setSelectedMember,
    activeTab, setActiveTab,
    selectedItems, setSelectedItems,
    isLoadingHistorico, isSubmitting,
    comprasVisiveisAgrupadas, totais,
    handleQuitarPendencia
  };
}