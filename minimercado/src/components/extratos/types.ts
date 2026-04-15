export interface Equipe {
  id: number;
  name: string;
}

export interface Membro {
  id: number;
  team_id: number;
  name: string;
}

export interface LinhaHistorico {
  id_linha: number; 
  member_id: number;
  date: string; 
  product_name: string; 
  category_name: string; 
  quantity: number; 
  price: number; 
  status: 'PENDENTE' | 'PAGO'; 
}

export interface ItemAgrupado {
  id_agrupado: string;
  date: string;
  product_name: string;
  category_name: string;
  quantity: number;
  price: number;
  status: 'PENDENTE' | 'PAGO';
  ids_originais: number[];
}