export interface Produto {
  id: number;
  name: string;
  category_id: number;
  category_name?: string; 
  price: number;
  stock: number;
}

export interface Categoria {
  id: number;
  name: string;
}