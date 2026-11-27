import Link from 'next/link';
import {cookies} from 'next/headers';
import {Carrito,Count} from '../componentes/Carrito';
import {cookieName} from '../lib/api';
import {logout} from './actions';
import './style.css';
export const metadata={title:'Mercado de origen · El Salvador',description:'Catálogo de productos salvadoreños'};
export default async function Layout({children}:{children:React.ReactNode}){
 const signed=(await cookies()).has(cookieName);
 return <html lang="es"><body><Carrito><header><nav><Link className="brand" href="/">Mercado de origen</Link><div className="links"><Link href="/">Catálogo</Link><Link href="/historial">Mis compras</Link><Link href="/checkout">Carrito (<Count/>)</Link>{signed?<form action={logout}><button className="text">Salir</button></form>:<Link href="/acceso">Ingresar</Link>}</div></nav></header><main>{children}</main></Carrito></body></html>;
}
