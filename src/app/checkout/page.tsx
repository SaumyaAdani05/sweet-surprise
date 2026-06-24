'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user, cart, placeOrder } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    }
  });

  // Pre-fill user data when loaded
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
      setValue('address', user.address || '');
    }
  }, [user, setValue]);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const onSubmit = async (data: CheckoutInput) => {
    setIsSubmitting(true);
    try {
      const res = await placeOrder(data.name, data.phone, data.address);
      if (res.success && res.orderId) {
        toast({
          title: "Order Placed!",
          description: `Order ${res.orderId} placed successfully.`,
          className: "bg-primary text-primary-foreground border-none shadow-xl"
        });
        router.push(`/order-confirmed?orderId=${res.orderId}`);
      } else {
        toast({
          title: "Order Failed",
          description: res.message || "Failed to place order. Please try again.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      toast({
        title: "Order Error",
        description: err.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return null; // Redirecting...
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.priceAtSelection * item.quantity), 0);

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6 font-body text-foreground animate-in fade-in duration-300">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
          <Link href="/cart" className="flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Cart</span>
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8 border-b pb-4 text-left">
        Delivery Checkout
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Form panel */}
        <div className="md:col-span-3">
          <Card className="border shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Delivery details</CardTitle>
              <CardDescription>Enter the coordinates where we should deliver your freshly baked surprise.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="checkout-name" className="font-semibold">Recipient Name</Label>
                  <Input
                    id="checkout-name"
                    {...register('name')}
                    placeholder="Enter full name"
                    className={`h-11 rounded-lg ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-phone" className="font-semibold">Contact Mobile Number</Label>
                  <Input
                    id="checkout-phone"
                    {...register('phone')}
                    placeholder="e.g., 9825084514"
                    className={`h-11 rounded-lg ${errors.phone ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.phone && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-address" className="font-semibold">Complete Delivery Address</Label>
                  <Textarea
                    id="checkout-address"
                    {...register('address')}
                    placeholder="Provide full street address, landmark, floor, and pincode"
                    rows={4}
                    className={`rounded-lg ${errors.address ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.address && (
                    <p className="text-xs font-semibold text-destructive mt-1">{errors.address.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2 h-12 shadow-md hover:shadow-lg transition-all rounded-xl"
                >
                  <span>{isSubmitting ? 'Confirming Order...' : 'Place Order'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Summary side panel */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border shadow-sm rounded-2xl bg-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini items list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-sm items-start gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {item.quantity} {item.selectedWeight ? `(${item.selectedWeight})` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-foreground shrink-0">
                      RS {item.priceAtSelection * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">RS {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t font-semibold">
                  <span className="font-bold text-base">Total Estimated</span>
                  <span className="font-headline font-bold text-xl text-primary">RS {subtotal}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm rounded-2xl border-primary/20 bg-primary/5 p-4">
            <h3 className="font-bold text-sm text-primary mb-2 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Manual Payment Settlement
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No online payments are processed here. Rinku Adani will contact you shortly after you submit this order to coordinate UPI or Cash on Delivery settlement.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
