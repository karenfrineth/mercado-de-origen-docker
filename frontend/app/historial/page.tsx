import {Suspense} from 'react';
import Link from 'next/link';
import {owned} from '../../lib/api';
import {Order,money} from '../../lib/types';
async function Orders(){
 const orders=await owned<Order[]>('/orders');
 return orders.length?<ul className="orders">{orders.map(o=><li key={o.id}><Link href={'/compras/'+o.id}>Orden #{o.id}</Link><span>{o.status==='paid'?'Pagada':'Pendiente'}</span><strong>{money(o.total_cents)}</strong></li>)}</ul>:<p>Todavía no tienes compras. <Link href="/">Ver catálogo</Link></p>;
}
export default function History(){return <><h1>Mis compras</h1><Suspense fallback={<p>Cargando historial…</p>}><Orders/></Suspense></>;}
