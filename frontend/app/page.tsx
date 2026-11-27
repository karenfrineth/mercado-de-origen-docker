import {Suspense} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {api} from '../lib/api';
import {Product,money,photo} from '../lib/types';
import {Add} from '../componentes/Carrito';
async function Products(){
 const products=await api<Product[]>('/products');
 return products.length?<div className="grid">{products.map((p,i)=>{
 const src=photo(p.name);
 return <article key={p.id}>{src&&<Link aria-label={'Ver '+p.name} href={'/catalogo/'+p.id}><Image src={src} alt="" width={680} height={440} sizes="(max-width:700px) 92vw, 31vw" priority={i===0}/></Link>}<div className="card"><p className="price">{money(p.price_cents)}</p><h2><Link href={'/catalogo/'+p.id}>{p.name}</Link></h2><p>{p.description}</p><Add product={p}/></div></article>;})}</div>:<p>El catálogo está vacío.</p>;
}
export default function Home(){return <><h1>Catálogo</h1><p className="intro">Café, cerámica y cacao de El Salvador.</p><Suspense fallback={<p role="status">Cargando productos…</p>}><Products/></Suspense></>;}
