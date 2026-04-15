import { useState, useEffect, useMemo } from 'react';
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';
import { fetchMemberStatement, settleMultipleSales } from '@/src/Server/controllers/SaleController'; 
import { Equipe, Membro, LinhaHistorico, ItemAgrupado } from '../types';

export function useExtratos(exibirAlerta: (msg: string, tipo: 'success' | 'error') => void) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [historicoBruto, setHistoricoBruto] = useState<LinhaHistorico[]>([]);

  const [selectedTeam, setSelectedTeam] = useState<Equipe | null>(null);
  const [selectedMember, setSelectedMember] = useState<Membro | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDENTE' | 'PAGO'>('PENDENTE');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);

  // 🟢 NOVA FUNÇÃO BLINDADA CONTRA FUSO HORÁRIO
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Pega apenas a parte da data (ex: "2026-04-15") ignorando o horário "T..."
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`; // Retorna padrão brasileiro DD/MM/AAAA
  };

  // Carrega Equipes e Membros iniciais
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

  // Busca o extrato do membro selecionado
  useEffect(() => {
    async function loadExtrato() {
      if (!selectedMember) return;
      
      setIsLoadingHistorico(true);
      setHistoricoBruto([]); 
      
      try {
        const res = await fetchMemberStatement(selectedMember.id) as any;
        if (res.success) {
          const todasVendas = [...(res.pending || []), ...(res.paid || [])];
          const formatado: LinhaHistorico[] = [];
          
          todasVendas.forEach((venda: any) => {
            const status = venda.status ? 'PAGO' : 'PENDENTE';
            // 🟢 Aplica a formatação limpa aqui
            const dataFormatada = formatDate(venda.date);
            
            venda.Item_sale.forEach((item: any) => {
              formatado.push({
                id_linha: venda.id, 
                member_id: venda.member_id,
                date: dataFormatada,
                product_name: item.Product.name,
                category_name: item.Product.Category.name,
                quantity: item.quantity,
                price: item.quantity * item.unit_price, 
                status: status as 'PENDENTE' | 'PAGO'
              });
            });
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

  // Cálculos Memoizados
  const comprasVisiveisAgrupadas = useMemo(() => {
    if (!selectedMember) return [];
    const comprasBrutas = historicoBruto.filter(item => item.member_id === selectedMember.id && item.status === activeTab);

    const agrupado = comprasBrutas.reduce((acc: Record<string, ItemAgrupado>, curr) => {
      // 🟢 Como já formatamos como "DD/MM/AAAA", não precisamos mais do split(' ')[0]
      const dataDia = curr.date; 
      const key = `${dataDia}-${curr.product_name}-${curr.status}`;
      
      if (!acc[key]) {
        acc[key] = {
          id_agrupado: key, date: dataDia, product_name: curr.product_name,
          category_name: curr.category_name, quantity: curr.quantity,
          price: curr.price, status: curr.status, ids_originais: [curr.id_linha] 
        };
      } else {
        acc[key].quantity += curr.quantity;
        acc[key].price += curr.price;
        acc[key].ids_originais.push(curr.id_linha);
      }
      return acc;
    }, {});

    return Object.values(agrupado);
  }, [selectedMember, activeTab, historicoBruto]);

  const totais = useMemo(() => {
    if (!selectedMember) return { pago: 0, pendente: 0, selecionado: 0 };
    
    const todasCompras = historicoBruto.filter(i => i.member_id === selectedMember.id);
    const pago = todasCompras.filter(i => i.status === 'PAGO').reduce((a, c) => a + c.price, 0);
    const pendente = todasCompras.filter(i => i.status === 'PENDENTE').reduce((a, c) => a + c.price, 0);
    const selecionado = comprasVisiveisAgrupadas.filter(i => selectedItems.includes(i.id_agrupado)).reduce((a, c) => a + c.price, 0);

    return { pago, pendente, selecionado };
  }, [selectedMember, comprasVisiveisAgrupadas, selectedItems, historicoBruto]);

  // Ações
  const handleQuitarPendencia = async () => {
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const vendasParaQuitar = new Set<number>();
      comprasVisiveisAgrupadas.forEach(grupo => {
        if (selectedItems.includes(grupo.id_agrupado)) {
          grupo.ids_originais.forEach(id => vendasParaQuitar.add(id));
        }
      });

      const saleIds = Array.from(vendasParaQuitar);
      const res = await settleMultipleSales(saleIds);
      
      if (res.success) {
        exibirAlerta(`Baixa realizada com sucesso!`, 'success');
        setSelectedItems([]); 
        setHistoricoBruto(prev => prev.map(item => saleIds.includes(item.id_linha) ? { ...item, status: 'PAGO' } : item));
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