export interface User {
  id: number; 
  name: string;
  user_id: string; 
}

export interface Team {
  name: string;
}

export interface Member {
  name: string;
  Team?: Team; 
}

export interface Product {
  name: string;
}

export interface ItemSale {
  quantity: number; 
  Product?: Product; 
}

export interface Sale {
  id: number;
  date: string; 
  total_value: number; 
  status: boolean; 
  payment_date?: string | null; 
  member?: Member; 
  Item_sale?: ItemSale[]; 
}