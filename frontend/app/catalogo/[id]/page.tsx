import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {api,ApiError} from '../../../lib/api';
import {Product,money,photo} from '../../../lib/types';
import {Add} from '../../../componentes/Carrito';
export default async function Detail({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^\d+$/.test(id))notFound();
 const p=await api<Product>('/products/'+id).catch(e=>{if(e instanceof ApiError&&e.status===404)notFound();throw e;});
 const src=photo(p.name);
 return <><Link href="/">← Catálogo</Link><section className="detail">{src&&<Image src={src} alt={p.name} width={800} height={520} priority/>}<div><h1>{p.name}</h1><p>{p.description}</p><p className="price">{money(p.price_cents)}</p><Add product={p}/></div></section></>;
}
