export interface Equipe {
  id: number;
  name: string;
}

export interface Membro {
  id: number;
  team_id: number;
  name: string;
}


export interface ItemResumoExtrato {
  quantity: number;
  name: string;
  item_discount: number;
  unit_price: number; 
  total_bruto: number; 
}


export interface ItemAgrupado {
  id_agrupado: string; 
  sale_id: number;
  date: string;
  items_resumo: ItemResumoExtrato[]; 
  valor_bruto: number;
  desconto: number;
  valor_liquido: number;
  status: 'PENDENTE' | 'PAGO';
}