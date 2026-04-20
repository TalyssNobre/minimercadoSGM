export interface Produto {
  id: number;
  name: string;
  category: string;
  price: number; // 🟢 O carrinho vai usar esse (que será o preço final)
  base_price?: number; // 🟢 Usado para calcular o desconto nos bastidores
  promo_status?: boolean; 
  image: string | null;
  stock: number;
}

export interface Equipe {
  id: number;
  name: string;
}

export interface Membro {
  id: number;
  team_id: number;
  name: string;
}

export interface CartItem {
  product: Produto;
  quantity: number;
}