'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {useCart} from './Carrito';
import {Pago} from './Pago';
import {money} from '../lib/types';
import {checkout} from '../app/actions';
export default function Checkout({signed}:{signed:boolean}){
 const {cart,save,ready}=useCart(),router=useRouter();
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[payment,setPayment]=useState<{id:number;secret:string;amount:number}|null>(null);
 async function order(){
  setBusy(true);setError('');
  try {const r=await checkout(cart);if(r.error)setError(r.error);else if(r.orderId&&r.secret&&r.amount!==undefined)setPayment({id:r.orderId,secret:r.secret,amount:r.amount});else if(r.orderId)router.replace('/compras/'+r.orderId);}
  catch{setError('No se pudo preparar la compra. Reintenta con el mismo carrito.');}
  finally{setBusy(false);}
 }
 if(!ready)return <p>Cargando carrito…</p>;
 if(!cart.items.length)return <p>Tu carrito está vacío. <Link href="/">Explorar el catálogo</Link></p>;
 return <div className="checkout"><div>{cart.items.map(i=><div className="row" key={i.product_id}><div><strong>{i.name}</strong><p>{i.quantity} × {money(i.unit_cents)}</p></div><button className="text" disabled={busy||!!payment} onClick={()=>save({reference:crypto.randomUUID(),items:cart.items.filter(v=>v.product_id!==i.product_id)})}>Quitar</button></div>)}
 <p>Total del carrito <strong>{money(cart.items.reduce((s,i)=>s+i.quantity*i.unit_cents,0))}</strong></p></div>
 <aside>{payment?<><p>Total de la orden <strong>{money(payment.amount)}</strong></p><Pago id={payment.id} secret={payment.secret}/></>:signed?<button onClick={order} disabled={busy}>{busy?'Preparando…':'Continuar al pago'}</button>:<Link className="button" href="/acceso">Ingresar para comprar</Link>}{error&&<p role="alert">{error} <Link href="/acceso">Ingresar</Link></p>}</aside></div>;
}
