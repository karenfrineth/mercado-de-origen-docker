'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useCart} from './Carrito';
import {refreshOrder} from '../app/actions';
export default function Verificar({id,reference,paid}:{id:number;reference:string;paid:boolean}){
 const {cart,ready,save}=useCart(),router=useRouter();const [note,setNote]=useState('');
 useEffect(()=>{if(ready&&paid&&cart.reference===reference)save({reference:'',items:[]});},[ready,paid,cart.reference,reference,save]);
 useEffect(()=>{
  if(paid)return;let active=true;let tries=0;let timer:ReturnType<typeof setTimeout>;
  async function poll(){try{const result=await refreshOrder(id);if(!active)return;if(result.status==='paid'){router.refresh();return;}}catch{}
   if(active&&++tries<5)timer=setTimeout(poll,2500);else if(active)setNote('Puedes volver a consultar el estado en unos momentos.');}
  timer=setTimeout(poll,1800);return ()=>{active=false;clearTimeout(timer);};
 },[paid,id,router]);
 return paid?null:<div><p role="status">{note||'Esperando la confirmación del pago.'}</p><button onClick={()=>router.refresh()}>Actualizar estado</button></div>;
}
