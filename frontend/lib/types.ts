export type Product = {id:number; name:string; description:string; price_cents:number};
export type Item = {product_id:number; name:string; unit_cents:number; quantity:number};
export type Order = {id:number; reference:string; status:string; total_cents:number; items:Item[]};
export type Cart = {reference:string; items:Item[]};
export const money = (cents:number) => 'US$ ' + (cents / 100).toFixed(2);
export function photo(name:string) {
  if (/café/i.test(name)) return '/img/cafe.webp';
  if (/barro/i.test(name)) return '/img/barro.webp';
  if (/chocolate/i.test(name)) return '/img/cacao.webp';
  return null;
}
