'use client';

import { useState, useEffect, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Inner component that reads search params
function OrderConfirmedContent() {
  const { orders } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [dbOrder, setDbOrder] = useState<any>(null);

  const isSupabasePlaceholder = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !url || url.includes('placeholder-project') || url === 'your_supabase_url';
  };

  useEffect(() => {
    if (!orderId) {
      router.push('/menu');
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      if (isSupabasePlaceholder()) {
        // Mock Mode: Find in local context
        const found = orders.find(o => o.id === orderId);
        setDbOrder(found || null);
        setLoading(false);
      } else {
        // Live Mode: Fetch from Supabase directly to get the trigger-calculated total
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('orders')
            .select(`
              *,
              order_items (
                *,
                products (name)
              )
            `)
            .eq('id', orderId)
            .single();

          if (!error && data) {
            setDbOrder({
              id: data.id,
              customerName: data.customer_name,
              customerPhone: data.customer_phone,
              customerAddress: data.customer_address,
              totalPrice: data.total_price,
              createdAt: data.created_at,
              items: (data.order_items || []).map((item: any) => ({
                productName: item.products?.name || 'Unknown Item',
                quantity: item.quantity,
                weight: item.weight,
                price: item.price_at_purchase * item.quantity
              }))
            });
          } else {
            console.error('Error fetching order details:', error?.message);
            // Fallback to local context orders if DB query fails
            const found = orders.find(o => o.id === orderId);
            setDbOrder(found || null);
          }
        } catch (e) {
          console.error('Error in fetching order:', e);
          const found = orders.find(o => o.id === orderId);
          setDbOrder(found || null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrder();
  }, [orderId, orders, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-sm">Verifying order receipt...</p>
      </div>
    );
  }

  if (!dbOrder) {
    return (
      <div className="container mx-auto max-w-lg py-24 px-4 text-center">
        <Card className="border shadow-lg rounded-2xl p-8 flex flex-col items-center">
          <CardTitle className="text-2xl font-headline font-bold text-destructive mb-2">Order Not Found</CardTitle>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn't retrieve the details for order ID <strong>{orderId}</strong>.
          </p>
          <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="/menu">Go to Menu</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 font-body text-foreground animate-in fade-in duration-300">
      <Card className="border shadow-lg rounded-3xl p-6 sm:p-10 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="p-5 bg-green-100 dark:bg-green-950/30 text-green-600 rounded-full mb-6 animate-pulse">
          <CheckCircle2 className="w-16 h-16" />
        </div>

        <CardTitle className="text-3xl font-headline font-bold mb-2">Order Placed Successfully!</CardTitle>
        <CardDescription className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
          Thank you for choosing Sweet Surprise. We have received your order details and sent them to our manager Rinku Adani.
        </CardDescription>

        {/* Order Details Panel */}
        <div className="bg-muted/40 border rounded-2xl w-full text-left p-5 sm:p-6 space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 gap-2">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Order Code</p>
              <p className="font-bold text-lg text-primary">{dbOrder.id}</p>
            </div>
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {new Date(dbOrder.createdAt || Date.now()).toLocaleDateString()} at{' '}
              {new Date(dbOrder.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b pb-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Customer Name</p>
              <p className="font-semibold text-foreground">{dbOrder.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Contact Number</p>
              <p className="font-semibold text-foreground">{dbOrder.customerPhone}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase mb-0.5">Delivery Address</p>
              <p className="font-semibold text-foreground leading-normal">{dbOrder.customerAddress}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2 text-sm border-b pb-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Items Summary</p>
            {dbOrder.items && dbOrder.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-foreground">
                <span className="font-semibold">
                  {item.productName} <span className="text-xs text-muted-foreground font-normal">({item.weight || 'Std'} × {item.quantity})</span>
                </span>
                <span className="font-bold">RS {item.price}</span>
              </div>
            ))}
          </div>

          {/* Recalculated total */}
          <div className="flex justify-between items-center font-bold">
            <span className="text-base text-foreground">Final Confirmed Total:</span>
            <span className="text-2xl font-headline text-primary">RS {dbOrder.totalPrice}</span>
          </div>
        </div>

        {/* Next Steps / Payment Instructions */}
        <Card className="border border-primary/20 bg-primary/5 rounded-2xl w-full p-4 mb-8 text-left flex gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-full shrink-0 h-fit mt-1">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-primary mb-1">Manual Payment Confirmation</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Rinku Adani will contact you shortly on <strong>{dbOrder.customerPhone}</strong> via call or WhatsApp to confirm delivery scheduling and coordinate payment (Cash on Delivery or UPI).
            </p>
          </div>
        </Card>

        {/* Action Button */}
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md flex items-center justify-center space-x-2 h-12 rounded-xl">
          <Link href="/menu">
            <span>Browse More Sweets</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}

// Wrapper with Suspense boundary
export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium text-sm">Loading confirmation...</p>
      </div>
    }>
      <OrderConfirmedContent />
    </Suspense>
  );
}
