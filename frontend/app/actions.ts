'use server';
import {redirect} from 'next/navigation';
import {cookies} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {api, cookieName, message} from '../lib/api';
import type {Cart,Order} from '../lib/types';

export async function register(_:string, form:FormData) {
  try {
    await api('/register',{data:{name:form.get('name'),email:form.get('email'),password:form.get('password')}});
  } catch(e) {return message(e);}
  redirect('/acceso?registro=1');
}
export async function logout() {
  (await cookies()).delete(cookieName);
  revalidatePath('/','layout'); redirect('/');
}
export async function checkout(cart:Cart):Promise<{orderId?:number; secret?:string; amount?:number; error?:string}> {
  try {
    const items = cart.items.map(({product_id,quantity})=>({product_id,quantity}));
    const order = await api<Order>('/orders',{private:true,data:{reference:cart.reference,items}});
    revalidatePath('/historial');
    if(order.status==='paid') return {orderId:order.id};
    const payment = await api<{client_secret:string;amount:number}>('/orders/'+order.id+'/payment',{private:true,data:{}});
    return {orderId:order.id,secret:payment.client_secret,amount:payment.amount};
  } catch(e) {return {error:message(e)};}
}
export async function refreshOrder(id:number) {
  if (!Number.isSafeInteger(id) || id<=0) return {error:'Orden inválida.'};
  try {
    const order=await api<Order>('/orders/'+id,{private:true});
    if(order.status==='paid') {revalidatePath('/historial');revalidatePath('/compras/'+id);}
    return {status:order.status};
  } catch(e) {return {error:message(e)};}
}
