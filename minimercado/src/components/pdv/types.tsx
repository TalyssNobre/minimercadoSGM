export interface Produto {
  id: number;
  name: string;
  category: string;
  price: number;
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