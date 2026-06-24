import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import * as z from 'zod';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = contactSchema.parse(body);
    const { name, email, subject, message } = validatedData;

    // Use admin client to write to notifications (bypasses RLS)
    const supabase = await createAdminClient();

    const notifId = 'contact_' + Date.now();
    const { error } = await supabase
      .from('notifications')
      .insert({
        id: notifId,
        type: 'contact',
        message: `New Contact Message: ${subject || 'No Subject'}`,
        details: `From: ${name} (${email})\nMessage: ${message}`,
        read: false,
      });

    if (error) {
      console.error('Error saving contact notification:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact Form Route Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid form input.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Server error.' }, { status: 500 });
  }
}
