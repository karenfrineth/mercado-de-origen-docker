'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import type {Cart,Product} from '../lib/types';
const empty:Cart={reference:'',items:[]};
const key='mercado.carrito.v1';
type Store={cart:Cart;ready:boolean;save:(v:Cart)=>void};
const Context=createContext<Store|null>(null);
export function Carrito({children}:{children:React.ReactNode}) {
  const [cart,set]=useState<Cart>(empty),[ready,loaded]=useState(false);
  useEffect(()=>{
    try {
      const raw=JSON.parse(localStorage.getItem(key)||'null');
      if(raw && typeof raw.reference==='string' && Array.isArray(raw.items) && raw.items.every((i:Cart['items'][number])=>i && Number.isInteger(i.product_id)&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=100&&typeof i.name==='string'&&Number.isInteger(i.unit_cents))) set(raw);
    } catch {} finally {loaded(true);}
  },[]);
  function save(v:Cart){set(v);try{localStorage.setItem(key,JSON.stringify(v));}catch{}}
  return <Context.Provider value={{cart,ready,save}}>{children}</Context.Provider>;
}
export function useCart(){const store=useContext(Context);if(!store)throw new Error('Carrito ausente');return store;}
export function Count(){const {cart}=useCart();return <>{cart.items.reduce((n,i)=>n+i.quantity,0)}</>;}
export function Add({product:p}:{product:Product}){
  const {cart,ready,save}=useCart();const [notice,setNotice]=useState('');
  function add(){
    const old=cart.items.find(i=>i.product_id===p.id);
    if(old && old.quantity>=100){setNotice('Máximo de 100 unidades.');return;}
    const items=old?cart.items.map(i=>i===old?{...i,quantity:i.quantity+1}:i):
      [...cart.items,{product_id:p.id,name:p.name,unit_cents:p.price_cents,quantity:1}];
    save({reference:crypto.randomUUID(),items});setNotice('Agregado al carrito.');
  }
  return <div><button disabled={!ready} onClick={add}>Agregar al carrito</button><small role="status">{notice}</small></div>;
}
