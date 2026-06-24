'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import type { Product } from '@/types';
import { customWeightSchema } from '@/lib/validations/product';

// Custom wrapper or standard HTML select if Select component is not registered.
// To ensure it works out of the box and matches the styling, we can use a standard Select styling or simple select tag with Tailwind classes.
// Let's implement a clean, premium HTML select tag with custom Tailwind classes for maximum reliability.

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState('');
  const [isCustomWeight, setIsCustomWeight] = useState(false);
  const [customWeightInput, setCustomWeightInput] = useState('500');
  const [customWeightUnit, setCustomWeightUnit] = useState('g');
  const [weightError, setWeightError] = useState<string | null>(null);
  const { toast } = useToast();

  const isCake = product.category === 'cakes';
  const isChoco = product.category === 'chocolates';

  // Set default weights
  useEffect(() => {
    if (isCake) {
      setWeight('500g');
      setCustomWeightInput('500');
      setCustomWeightUnit('g');
    } else if (isChoco) {
      setWeight('250g');
      setCustomWeightInput('250');
      setCustomWeightUnit('g');
    } else {
      setWeight('');
    }
  }, [isCake, isChoco]);

  // Validate custom weight changes
  useEffect(() => {
    if (!isCustomWeight) {
      setWeightError(null);
      return;
    }
    const val = parseFloat(customWeightInput);
    if (isNaN(val)) {
      setWeightError('Weight must be a number');
      return;
    }
    const result = customWeightSchema.safeParse({ value: val, unit: customWeightUnit });
    if (!result.success) {
      setWeightError(result.error.errors[0].message);
    } else {
      setWeightError(null);
    }
  }, [customWeightInput, customWeightUnit, isCustomWeight]);

  const basePrice = parseInt(product.price?.replace(/[^0-9]/g, '') || '0') || 0;

  const getMultiplier = () => {
    if (isCustomWeight) {
      const val = parseFloat(customWeightInput);
      if (isNaN(val) || val <= 0) return 0;
      const factor = customWeightUnit === 'kg' ? 1000 : 1;
      const weightInGrams = val * factor;
      if (isCake) {
        return weightInGrams / 500;
      } else if (isChoco) {
        return weightInGrams / 250;
      }
      return 1.0;
    }
    if (isCake) {
      switch (weight) {
        case '500g': return 1.0;
        case '1kg': return 2.0;
        case '1.5kg': return 3.0;
        case '2kg': return 4.0;
        case '3kg': return 6.0;
        case '5kg': return 10.0;
        default: return 1.0;
      }
    } else if (isChoco) {
      switch (weight) {
        case '100g': return 0.4;
        case '250g': return 1.0;
        case '500g': return 2.0;
        case '1kg': return 4.0;
        default: return 1.0;
      }
    }
    return 1.0;
  };

  const effectiveWeight = isCustomWeight ? `${customWeightInput}${customWeightUnit}` : weight;
  const itemPrice = Math.round(basePrice * getMultiplier());
  const totalPrice = itemPrice * quantity;

  const handleAddToCart = () => {
    if (isCustomWeight && weightError) {
      toast({
        title: "Invalid Portion",
        description: weightError,
        variant: "destructive",
      });
      return;
    }

    addToCart(product, quantity, effectiveWeight || undefined);
    toast({
      title: "Added to Cart!",
      description: `${quantity}x ${product.name} ${effectiveWeight ? `(${effectiveWeight})` : ''} has been added to your cart.`,
      className: "bg-primary text-primary-foreground border-none shadow-xl",
    });
  };

  return (
    <div className="space-y-6">
      {/* Weight Selector */}
      {(isCake || isChoco) && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground flex justify-between">
            <span>Select Weight / Portion:</span>
            <span className="text-xs text-muted-foreground font-normal">
              {isCake ? 'Base price is for 500g' : 'Base price is for 250g'}
            </span>
          </label>
          <div className="relative">
            <select
              value={isCustomWeight ? 'custom' : weight}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomWeight(true);
                } else {
                  setIsCustomWeight(false);
                  setWeight(e.target.value);
                }
              }}
              className="w-full bg-background border border-input text-foreground text-sm rounded-md h-10 px-3 py-1 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
            >
              {isCake ? (
                <>
                  <option value="500g">500g (Half Kg) - RS {basePrice}</option>
                  <option value="1kg">1kg (One Kg) - RS {basePrice * 2}</option>
                  <option value="1.5kg">1.5kg - RS {basePrice * 3}</option>
                  <option value="2kg">2kg - RS {basePrice * 4}</option>
                  <option value="3kg">3kg - RS {basePrice * 6}</option>
                  <option value="5kg">5kg - RS {basePrice * 10}</option>
                  <option value="custom">Custom Weight...</option>
                </>
              ) : (
                <>
                  <option value="100g">100g - RS {Math.round(basePrice * 0.4)}</option>
                  <option value="250g">250g (Standard Box) - RS {basePrice}</option>
                  <option value="500g">500g - RS {basePrice * 2}</option>
                  <option value="1kg">1kg (Bulk Pack) - RS {basePrice * 4}</option>
                  <option value="custom">Custom Weight...</option>
                </>
              )}
            </select>
          </div>

          {/* Custom Weight Numeric Input */}
          {isCustomWeight && (
            <div className="space-y-1.5 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center space-x-2">
                <div className="relative flex-grow">
                  <Input
                    type="number"
                    min="0.1"
                    step="any"
                    value={customWeightInput}
                    onChange={(e) => setCustomWeightInput(e.target.value)}
                    placeholder="Enter custom weight"
                    className="h-10 pr-12 font-semibold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">Value</span>
                </div>
                <select
                  value={customWeightUnit}
                  onChange={(e) => setCustomWeightUnit(e.target.value)}
                  className="bg-background border border-input text-foreground text-sm rounded-md h-10 px-3 outline-none font-semibold"
                >
                  <option value="g">Grams (g)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>
              {weightError && (
                <p className="text-xs font-semibold text-destructive mt-1 ml-1">{weightError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pricing display */}
      <div className="bg-muted/40 p-4 rounded-lg flex items-center justify-between border">
        <span className="text-sm text-muted-foreground font-medium">Calculated Price:</span>
        <span className="text-2xl font-headline font-bold text-primary">
          RS {totalPrice} {effectiveWeight && <span className="text-xs text-muted-foreground font-normal">({quantity}x {effectiveWeight})</span>}
        </span>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center space-x-4">
        <span className="text-foreground font-semibold">Quantity:</span>
        <div className="flex items-center border border-input rounded-md bg-background">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-r-none border-r border-input"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(prev => prev + 1)}
            className="h-10 w-10 rounded-l-none border-l border-input"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button 
        onClick={handleAddToCart} 
        disabled={isCustomWeight && !!weightError}
        size="lg" 
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all duration-300"
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Add to Cart</span>
      </Button>
    </div>
  );
}
