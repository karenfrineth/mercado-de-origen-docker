import Link from 'next/link';
import {notFound} from 'next/navigation';
import {owned,ApiError} from '../../../lib/api';
import {Order,money} from '../../../lib/types';
import Verificar from '../../../componentes/Verificar';
export default async function Receipt({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^\d+$/.test(id))notFound();
 const o=await owned<Order>('/orders/'+id).catch(e=>{if(e instanceof ApiError&&e.status===404)notFound();throw e;});
 return <section className="panel"><p className="price">Orden #{o.id}</p><h1>{o.status==='paid'?'Compra confirmada':'Pago pendiente'}</h1>{o.items.map(i=><p key={i.product_id}>{i.quantity} × {i.name} · {money(i.unit_cents*i.quantity)}</p>)}<p><strong>Total {money(o.total_cents)}</strong></p><Verificar id={o.id} reference={o.reference} paid={o.status==='paid'}/><p><Link href="/historial">Ver mis compras</Link></p></section>;
}
