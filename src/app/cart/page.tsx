'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { user, cart, removeFromCart, updateCartQuantity } = useApp();

  const handleQtyChange = (cartItemId: string, currentQty: number, change: number) => {
    updateCartQuantity(cartItemId, Math.max(1, currentQty + change));
  };

  // Cart totals
  const subtotal = cart.reduce((sum, item) => sum + (item.priceAtSelection * item.quantity), 0);

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6 font-body text-foreground">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-10 text-left border-b pb-4">
        Your Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <Card className="border shadow-sm p-12 text-center flex flex-col items-center rounded-xl">
          <div className="p-4 bg-primary/10 text-primary rounded-full mb-6">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Looks like you haven't added any sweets to your cart yet. Take a look at our artisan cakes and chocolates!
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Link href="/menu">Go to Menu</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.cartItemId} className="overflow-hidden border shadow-sm rounded-xl">
                <div className="flex flex-row p-4 sm:p-5 items-center gap-4 sm:gap-6">
                  {/* Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 border bg-muted">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-headline font-bold text-lg sm:text-xl truncate text-foreground mb-1">
                      {item.product.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
                      {item.selectedWeight && (
                        <span>
                          <span className="font-semibold text-foreground/70">Weight:</span> {item.selectedWeight}
                        </span>
                      )}
                      <span>
                        <span className="font-semibold text-foreground/70">Price:</span> RS {item.priceAtSelection}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-input rounded-md bg-background h-8">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQtyChange(item.cartItemId, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 rounded-r-none border-r border-input"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold text-foreground">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleQtyChange(item.cartItemId, item.quantity, 1)}
                          className="h-8 w-8 rounded-l-none border-l border-input"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-md"
                        aria-label="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Total Price */}
                  <div className="text-right shrink-0">
                    <span className="font-headline font-bold text-base sm:text-lg text-primary">
                      RS {item.priceAtSelection * item.quantity}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Checkout & Summary Panel */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="border shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="font-headline text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">RS {subtotal}</span>
                </div>
                <div className="flex justify-between border-b pb-4">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-green-500 font-semibold uppercase">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-base">Total Price</span>
                  <span className="font-headline font-bold text-2xl text-primary">RS {subtotal}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Actions */}
            {user ? (
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2 shadow-md h-12 text-base">
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            ) : (
              <Card className="border shadow-sm rounded-xl p-6 text-center">
                <h3 className="font-bold text-lg mb-2">Check Out Securely</h3>
                <p className="text-muted-foreground text-xs leading-normal mb-4">
                  You must be logged in to finalize your purchase and submit order details to the manager.
                </p>
                <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link href="/login?redirect=/checkout">Login to Checkout</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
