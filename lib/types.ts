export type Product = {
  id: number; name: string; category: string; categoryId: number; price: number;
  color: string; image: string; gallery: string[]; tag?: string;
  sizes: string[]; stock: number; description: string;
};
export type CartItem = { id: number; product: Product; size: string; quantity: number; subtotal: number };
export type Navigate = (route: string, category?: string) => void;
export type SimplePageType = "login" | "checkout" | "perfil";
export type Session = { token: string; id: number; nome: string; email: string; role: "CLIENTE" | "ADMIN" };
export type Category = { id: number; nome: string };
export type ProductResponse = { id: number; nome: string; descricao: string | null; imagem: string | null; preco: number; quantidade: number; tamanho: string | null; categoriaId: number; categoriaNome: string };
export type CartResponse = { id: number; total: number; itens: { id: number; produtoId: number; nomeProduto: string; imagemProduto: string | null; preco: number; tamanho: string; quantidade: number; subtotal: number }[] };
export type AddressInput = { cep: string; estado: string; cidade: string; bairro: string; rua: string; numero: number; complemento: string };
export type Address = AddressInput & { id: number };
export type Order = { id: number; dataPedido: string; status: "AGUARDANDO_PAGAMENTO" | "ENVIADO" | "ENTREGUE"; formaPagamento: string; valorTotal: number; enderecoEntrega: string; clienteNome: string; clienteEmail: string; itens: { nomeProduto: string; quantidade: number; tamanho: string; precoUnitario: number }[] };