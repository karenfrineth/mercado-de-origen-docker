'use client';
import {useActionState} from 'react';
import {register} from '../actions';
export default function Register(){
 const [error,action,pending]=useActionState(register,'');
 return <section className="panel"><h1>Crear cuenta</h1><form action={action}><label>Nombre<input name="name" required maxLength={100} autoComplete="name"/></label><label>Correo<input name="email" type="email" required autoComplete="email"/></label><label>Contraseña (12 caracteres o más)<input name="password" type="password" minLength={12} maxLength={72} required autoComplete="new-password"/></label><button disabled={pending}>Registrarme</button></form>{error&&<p role="alert">{error}</p>}</section>;
}
