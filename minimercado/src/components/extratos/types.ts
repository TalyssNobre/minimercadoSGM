export interface Equipe {
  id: number;
  name: string;
}

export interface Membro {
  id: number;
  team_id: number;
  name: string;
}

// 🟢 Agora a nossa linha do extrato representa a VENDA inteira, igual nos outros painéis
export interface ItemAgrupado {
  id_agrupado: string; 
  sale_id: number;
  date: string;
  items_resumo: string; // Ex: "1x Pão, 2x Café"
  valor_bruto: number;
  desconto: number;
  valor_liquido: number;
  status: 'PENDENTE' | 'PAGO';
}

// Podemos manter essa vazia ou apagar, não usaremos mais a linha fragmentada
export interface LinhaHistorico {}