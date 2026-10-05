export interface Produto {
  id: number;
  name: string;
  category: string;
  category_id?: number | string; // 🟢 NOVO: O front precisa disso para o modal saber filtrar a bebida correta
  price: number; // O carrinho vai usar esse (que será o preço final)
  base_price?: number; // Usado para calcular o desconto nos bastidores
  promo_status?: boolean; 
  image: string | null;
  stock: number;

  // Propriedades do Combo
  isCombo?: boolean;
  combo_description?: string;
  combo?: any; // 🟢 NOVO: O front vai receber o JSON cru do backend aqui dentro
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
  customizacao?: any[]; // 🟢 NOVO: Onde o carrinho vai guardar a "Coca-Cola" ou "Suco" que o cliente escolheu no modal
}