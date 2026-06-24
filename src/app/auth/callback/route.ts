import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Sanitize origin for local development (replace 0.0.0.0 with localhost)
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const redirectOrigin = (isLocalEnv && origin.includes('0.0.0.0')) 
    ? origin.replace('0.0.0.0', 'localhost') 
    : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host'); // Original origin before load balancer
      if (isLocalEnv) {
        return NextResponse.redirect(`${redirectOrigin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${redirectOrigin}${next}`);
      }
    }
  }

  // Return the user to the login page with an error parameter
  return NextResponse.redirect(`${redirectOrigin}/login?error=Authentication failed`);
}
