import Checkout from '../../componentes/Checkout';
import {cookies} from 'next/headers';
import {cookieName} from '../../lib/api';
export default async function Page(){return <><h1>Tu carrito</h1><Checkout signed={(await cookies()).has(cookieName)}/></>;}
