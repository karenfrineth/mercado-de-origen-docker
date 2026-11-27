'use client';
import {useState,useEffect,useRef} from 'react';
import {loadStripe,type Stripe,type StripeElements} from '@stripe/stripe-js';
import {useRouter} from 'next/navigation';
let sdk:ReturnType<typeof loadStripe>|undefined;
export function Pago({secret,id}:{secret:string;id:number}){
 const host=useRef<HTMLDivElement>(null), stripe=useRef<Stripe|null>(null), elements=useRef<StripeElements|null>(null);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const router=useRouter();
 useEffect(()=>{
  let active=true;
  const key=process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if(!key){setError('Falta configurar la clave publicable de Stripe.');return;}
  sdk??=loadStripe(key);
  sdk.then(s=>{
   if(!active)return;
   if(!s||!host.current)throw new Error();
   stripe.current=s;const group=s.elements({clientSecret:secret});elements.current=group;
   const widget=group.create('payment');widget.on('ready',()=>setReady(true));
   widget.on('loaderror',()=>setError('No se pudo cargar el formulario de Stripe.'));
   widget.mount(host.current);
  }).catch(()=>{if(active)setError('No se pudo cargar Stripe.');});
  return ()=>{active=false;elements.current?.getElement('payment')?.destroy();};
 },[secret]);
 async function pay(){
  if(!stripe.current||!elements.current||busy)return;
  setBusy(true);setError('');
  try {
   const result=await stripe.current.confirmPayment({elements:elements.current,
    confirmParams:{return_url:location.origin+'/compras/'+id},redirect:'if_required'});
   if(result.error)setError(result.error.message||'El pago requiere atención.');
   else router.replace('/compras/'+id);
  }catch{setError('No pudimos verificar el intento. Revisa Mis compras antes de repetirlo.');}
  finally{setBusy(false);}
 }
 return <section><h2>Datos de pago</h2><div ref={host}/>{error&&<p role="alert">{error}</p>}<button disabled={!ready||busy} onClick={pay}>{busy?'Procesando…':'Confirmar pago'}</button></section>;
}
