import {NextRequest,NextResponse} from 'next/server';
import {api,cookieName,ApiError} from '../../lib/api';
export async function POST(req:NextRequest) {
  const origin = process.env.APP_ORIGIN || req.nextUrl.origin;
  if(req.headers.get('origin') !== origin) return new Response('Origen inválido',{status:403});
  const form=await req.formData();
  try {
    const token=await api<{access_token:string;expires_in:number}>('/login',{data:{email:form.get('email'),password:form.get('password')}});
    const res=NextResponse.redirect(new URL('/checkout',origin),303);
    res.cookies.set(cookieName,token.access_token,{httpOnly:true,sameSite:'lax',path:'/',
      secure:process.env.COOKIE_SECURE!=='false',maxAge:token.expires_in});
    return res;
  } catch(e) {
    const code=e instanceof ApiError && e.status===401?'credenciales':'servicio';
    return NextResponse.redirect(new URL('/acceso?error='+code,origin),303);
  }
}
