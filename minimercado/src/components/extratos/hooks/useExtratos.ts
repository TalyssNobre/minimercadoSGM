import { useState, useEffect, useMemo } from 'react';
import { getAllTeams } from '@/src/Server/controllers/TeamController';
import { getAllMember } from '@/src/Server/controllers/MemberController';
import { fetchMemberStatement, settleMultipleSales } from '@/src/Server/controllers/SaleController'; 
import { getLoggedUserController } from '@/src/Server/controllers/UserController';
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

  const [userRole, setUserRole] = useState<string>('');

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const apenasData = dateString.split('T')[0];
    const [ano, mes, dia] = apenasData.split('-');
    return `${dia}/${mes}/${ano}`; 
  };

  useEffect(() => {
    async function fetchDados() {
      try {
        const [teamsResp, membersResp, userResp] = await Promise.all([
          getAllTeams() as any,
          getAllMember() as any,
          getLoggedUserController() as any
        ]);
        
        if (teamsResp?.success) setEquipes(teamsResp.data || teamsResp.team || []);
        if (membersResp?.success) setMembros(membersResp.data || membersResp.member || []);
        
        if (userResp) {
          const profileExtraido = userResp.user?.profile || userResp.data?.user?.profile || 'Desconhecido';
          setUserRole(String(profileExtraido).trim().toUpperCase());
        }

      } catch (error) {
        exibirAlerta("Erro ao carregar os dados iniciais.", "error");
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
          
          const formatado: ItemAgrupado[] = todasVendas.map((venda: any) => {
            const itensVenda = venda.Item_sale || venda.item_sale || [];
            
            // 🟢 MATEMÁTICA BLINDADA: Recalculando do zero a partir dos itens
            let calculoBruto = 0;
            let totalDescontoItens = 0;

            const itensArrayObj = itensVenda.map((i: any) => {
              // Puxa o preço de onde ele estiver salvo
              const unitPrice = Number(i.unit_price) || Number(i.price) || Number(i.Product?.price) || Number(i.product?.price) || 0;
              const quantity = Number(i.quantity) || 1;
              const itemDiscount = Number(i.item_discount) || 0;
              const totalBrutoItem = unitPrice * quantity;

              calculoBruto += totalBrutoItem;
              totalDescontoItens += itemDiscount;

              return {
                quantity: quantity,
                name: i.Product?.name || i.product?.name || 'Item',
                item_discount: itemDiscount,
                unit_price: unitPrice,
                total_bruto: totalBrutoItem
              };
            });

            const descontoGeral = Number(venda.discount) || 0;
            const descontoFinal = totalDescontoItens + descontoGeral;
            
            // Usamos o calculoBruto por segurança para garantir que a nota bata os centavos
            const valorBrutoFinal = calculoBruto > 0 ? calculoBruto : (Number(venda.total_value) || 0);
            const liquido = Math.max(0, valorBrutoFinal - descontoFinal);

            return {
              id_agrupado: venda.id.toString(), 
              sale_id: venda.id,
              date: formatDate(venda.date),
              items_resumo: itensArrayObj, 
              valor_bruto: valorBrutoFinal,
              desconto: descontoFinal,
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

  const comprasVisiveisAgrupadas = useMemo(() => {
    if (!selectedMember) return [];
    return historicoBruto.filter(item => item.status === activeTab);
  }, [selectedMember, activeTab, historicoBruto]);

  const totais = useMemo(() => {
    if (!selectedMember) return { pago: 0, pendente: 0, selecionado: 0, descontos: 0 };
    
    const pago = historicoBruto.filter(i => i.status === 'PAGO').reduce((a, c) => a + c.valor_liquido, 0);
    const pendente = historicoBruto.filter(i => i.status === 'PENDENTE').reduce((a, c) => a + c.valor_liquido, 0);
    const selecionado = comprasVisiveisAgrupadas.filter(i => selectedItems.includes(i.id_agrupado)).reduce((a, c) => a + c.valor_liquido, 0);
    
    // 🟢 BUG CORRIGIDO: Agora o Front-end calcula os descontos apenas dos itens visíveis na aba atual
    const descontos = comprasVisiveisAgrupadas.reduce((a, c) => a + c.desconto, 0);

    return { pago, pendente, selecionado, descontos };
  }, [selectedMember, comprasVisiveisAgrupadas, selectedItems, historicoBruto]);

  const handleQuitarPendencia = async () => {
    if (selectedItems.length === 0) return;
    setIsSubmitting(true);
    
    try {
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
    handleQuitarPendencia,
    userRole,
    historicoBruto
  };
}