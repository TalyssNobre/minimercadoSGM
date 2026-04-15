export interface ItemVenda {
  id_item_sale: number; 
  name: string; 
  quantity: number; 
}

export interface Venda {
  sale_id: number;
  date: string;
  operator_id: number;
  operator_name: string; 
  client_name: string; 
  total_value: number;
  status: boolean; 
  items: ItemVenda[];
}

export interface Operador {
  user_id: number;
  name: string;
}