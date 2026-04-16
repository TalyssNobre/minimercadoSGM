export interface Category {
  id: number; 
  name: string;
}

export interface Product {
  id: number; 
  name: string;
  category_id: number; 
}

export interface ItemSale {
  product_id: number; 
  qty: number;
  price: number; 
}

export interface Sale {
  sale_id: number; 
  date: string;
  operator_name: string; 
  client_name: string; 
  status: 'ATIVA' | 'CANCELADA'; 
  payment_status: 'PAGO' | 'FIADO'; 
  items: ItemSale[]; 
  discount?: number; // 🟢 Novo
}

export interface HistoricoLinha {
  id_unico: string;
  data: string;
  operador: string;
  cliente: string;
  produto_nome: string;
  categoria_id: number;
  qty: number;
  pagamento: string;
  valor_total: number;
  valor_liquido?: number; // 🟢 Novo: Valor do item após a proporção do desconto
}