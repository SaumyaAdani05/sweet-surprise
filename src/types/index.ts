export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  imageHint?: string;
  description: string;
  category: string;
  price?: string; 
}

export interface Category {
  id: string;
  name: string;
  products: Product[];
}
