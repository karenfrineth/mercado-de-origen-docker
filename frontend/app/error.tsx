'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section role="alert"><h1>No pudimos cargar esta página</h1><p>Comprueba la conexión y vuelve a intentarlo.</p><button onClick={reset}>Reintentar</button></section>;}
