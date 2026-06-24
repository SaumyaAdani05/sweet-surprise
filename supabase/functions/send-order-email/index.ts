import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    console.log('Webhook payload received:', payload);

    const record = payload.record;
    if (!record || record.total_price <= 0) {
      return new Response(JSON.stringify({ message: 'Ignore order with zero total' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch order items and their product names
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        weight,
        price_at_purchase,
        products (name)
      `)
      .eq('order_id', record.id);

    if (itemsError) {
      throw new Error(`Failed to fetch order items: ${itemsError.message}`);
    }

    // Retrieve customer email from auth
    let customerEmail = 'info@sweetsurprise.com';
    if (record.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(record.user_id);
      if (!userError && userData?.user?.email) {
        customerEmail = userData.user.email;
      }
    }

    // Format list of items
    const itemsHtml = (orderItems || [])
      .map(
        (item: any) => `
      <li>
        <strong>${item.products?.name || 'Unknown Item'}</strong> (${item.weight || 'Standard'}) - Qty: ${item.quantity} - Price: RS ${item.price_at_purchase * item.quantity}
      </li>
    `
      )
      .join('');

    // Owner notification email body
    const ownerEmailBody = `
      <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
        <h1 style="color: #FF69B4; font-family: Georgia, serif;">New Order Alert!</h1>
        <p>A new order has been successfully placed on Sweet Surprise.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <h2 style="font-size: 16px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Order Details</h2>
        <p><strong>Order ID:</strong> ${record.id}</p>
        <p><strong>Customer Name:</strong> ${record.customer_name}</p>
        <p><strong>Phone:</strong> ${record.customer_phone}</p>
        <p><strong>Delivery Address:</strong> ${record.customer_address}</p>
        <p><strong>Total Price:</strong> RS ${record.total_price}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="font-size: 16px; color: #666;">Items Ordered</h3>
        <ul>
          ${itemsHtml}
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Please log into the Admin Dashboard to manage this order and coordinate payment/delivery manually.</p>
      </div>
    `;

    // Customer confirmation email body
    const customerEmailBody = `
      <div style="font-family: sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
        <h1 style="color: #FF69B4; font-family: Georgia, serif;">Thank you for your order, ${record.customer_name}!</h1>
        <p>We have received your order details and are crafting your custom treats.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <h2 style="font-size: 16px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Order Summary</h2>
        <p><strong>Order ID:</strong> ${record.id}</p>
        <p><strong>Delivery Address:</strong> ${record.customer_address}</p>
        <p><strong>Total Price:</strong> RS ${record.total_price}</p>
        <h3 style="font-size: 16px; color: #666;">Items</h3>
        <ul>
          ${itemsHtml}
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Important Note:</strong> Payment will be settled manually. Rinku Adani will contact you shortly via call or WhatsApp at <strong>${record.customer_phone}</strong> to confirm your order and coordinate cash-on-delivery or UPI payment details.</p>
        <p>For any queries, please feel free to reach out to us at <strong>+91 98250 84514</strong>.</p>
      </div>
    `;

    // Send to owner (Rinku Adani)
    const ownerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Sweet Surprise <orders@sweetsurprise.com>',
        to: 'info@sweetsurprise.com',
        subject: `[New Order Alert] ${record.id} - RS ${record.total_price}`,
        html: ownerEmailBody,
      }),
    });

    if (!ownerRes.ok) {
      const errText = await ownerRes.text();
      console.error('Failed to send email to owner:', errText);
    }

    // Send to customer
    if (customerEmail && customerEmail !== 'info@sweetsurprise.com') {
      const customerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Sweet Surprise <orders@sweetsurprise.com>',
          to: customerEmail,
          subject: `Your Sweet Surprise Order Confirmation - ${record.id}`,
          html: customerEmailBody,
        }),
      });

      if (!customerRes.ok) {
        const errText = await customerRes.text();
        console.error('Failed to send email to customer:', errText);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
