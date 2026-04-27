export interface ItemVenda {
  id_item_sale: number; 
  name: string; 
  quantity: number; 
  item_discount?: number; // 🟢 Novo: Reconhecendo o desconto do item
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
  discount?: number; 
}

export interface Operador {
  user_id: number;
  name: string;
}