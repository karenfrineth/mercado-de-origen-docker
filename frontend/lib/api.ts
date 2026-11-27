import 'server-only';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
export const cookieName = 'mercado_session';
export class ApiError extends Error {
  constructor(public status:number, message:string) { super(message); }
}
export async function api<T>(path:string, options:{private?:boolean; data?:unknown} = {}):Promise<T> {
  const headers:Record<string,string> = {Accept:'application/json'};
  if (options.private) {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) throw new ApiError(401,'Inicia sesión para continuar.');
    headers.Authorization = 'Bearer ' + token;
  }
  const base = process.env.BASE_URL;
  if (!base) throw new Error('Configura BASE_URL.');
  if (options.data !== undefined) headers['Content-Type']='application/json';
  const res = await fetch(base.replace(/\/$/,'')+path, {
    method: options.data === undefined ? 'GET' : 'POST', headers, cache:'no-store',
    body:options.data === undefined ? undefined : JSON.stringify(options.data),
    signal:AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    const body = await res.json().catch(()=>null);
    throw new ApiError(res.status, res.status>=500 ? 'El servicio no está disponible. Inténtalo de nuevo.' :
      Object.values(body?.error?.details ?? {}).flat().join(' ') || body?.error?.message || 'No se pudo completar la solicitud.');
  }
  return res.json();
}
export async function owned<T>(path:string) {
  try {return await api<T>(path,{private:true});}
  catch(e) {if(e instanceof ApiError && e.status===401) redirect('/acceso'); throw e;}
}
export function message(e:unknown) {return e instanceof ApiError ? e.message : 'No se pudo conectar. Inténtalo de nuevo.';}
