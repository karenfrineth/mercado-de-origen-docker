import Link from 'next/link';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string;registro?:string}>}){
 const q=await searchParams;
 return <section className="panel"><h1>Ingresar</h1>{q.registro&&<p role="status">Tu cuenta está lista. Inicia sesión.</p>}{q.error&&<p role="alert">{q.error==='credenciales'?'Revisa tu correo y contraseña.':'No se pudo iniciar sesión. Inténtalo otra vez.'}</p>}
 <form method="post" action="/sesion"><label>Correo<input name="email" type="email" autoComplete="email" required/></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required/></label><button>Iniciar sesión</button></form><p><Link href="/registro">Crear una cuenta</Link></p></section>;
}
