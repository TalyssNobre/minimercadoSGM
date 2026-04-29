export interface Equipe {
  id: number;
  name: string;
}

export interface Membro {
  id: number;
  team_id: number;
  name: string;
}

// 🟢 1. CRIAMOS essa interface para o Extrato entender cada produto individualmente
export interface ItemResumoExtrato {
  quantity: number;
  name: string;
  item_discount: number;
}

// 🟢 2. ATUALIZAMOS o ItemAgrupado para usar a interface nova ao invés de 'string'
export interface ItemAgrupado {
  id_agrupado: string; 
  sale_id: number;
  date: string;
  items_resumo: ItemResumoExtrato[]; // <-- Aqui mudou! Agora é uma lista de itens
  valor_bruto: number;
  desconto: number;
  valor_liquido: number;
  status: 'PENDENTE' | 'PAGO';
}