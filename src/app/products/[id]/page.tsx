'use client';

import { useApp } from '@/context/AppContext';
import { useParams, redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import ProductActions from '@/components/ProductActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { categories } = useApp();

  const products = categories.flatMap((category) => category.products);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="container mx-auto py-24 px-4 text-center font-body">
        <h1 className="text-3xl font-headline font-bold text-foreground">Sweet Product Not Found</h1>
        <p className="text-muted-foreground mt-4 max-w-md mx-auto">
          The item you are looking for might have been moved or removed from our menu.
        </p>
        <Button asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Link href="/menu">Back to Menu</Link>
        </Button>
      </div>
    );
  }

  if (product.category === 'packing_bouquets') {
    redirect('/#contact');
  }

  // Get related products (same category, excluding current product)
  const category = categories.find((cat) => cat.id === product.category);
  const relatedProducts = category
    ? category.products.filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  // Dynamic details generator based on product category
  const getMockDetails = (prod: typeof product) => {
    if (prod.category === 'cakes') {
      return {
        ingredients: 'Organic unbleached flour, fresh dairy cream, farm-fresh eggs, pure cane sugar, natural vanilla or premium cocoa. Fusion cakes include cardamom, saffron, gulab jamun, or paan extract.',
        dietary: 'Vegetarian. Contains wheat, dairy, and eggs.',
        bakingTime: 'Baked fresh daily for your order',
        isEdible: true
      };
    } else if (prod.category === 'chocolates') {
      return {
        ingredients: 'Premium Belgian cocoa solids, sugar, cocoa butter, milk solids, lecithin (emulsifier), natural vanilla flavor. Custom truffles include whole almonds, hazelnuts, coffee, or fruits.',
        dietary: 'Vegetarian. Contains dairy. May contain traces of nuts and gluten.',
        bakingTime: 'Prepared fresh in small handcrafted batches',
        isEdible: true
      };
    } else if (prod.category === 'cookies') {
      return {
        ingredients: 'Pure cream butter, cane sugar, organic unbleached flour, fresh eggs, chocolate chunks, rolled oats, raisins, or peanuts depending on selection.',
        dietary: 'Vegetarian. Contains wheat, dairy, and eggs. Peanut butter cookies contain peanuts.',
        bakingTime: 'Baked fresh in batches throughout the day',
        isEdible: true
      };
    } else { // packing_bouquets
      return {
        ingredients: 'Premium packaging materials including custom trays, clothing boxes, fabric wraps, satin ribbons, net layers, floral wires, and artificial decorations. Fresh flowers or premium chocolate truffles for bouquets.',
        dietary: 'Non-edible decorative gift arrangements. (Bouquets may contain wrapped edible chocolates).',
        bakingTime: 'Handcrafted and assembled to order',
        isEdible: false
      };
    }
  };

  const details = getMockDetails(product);

  return (
    <div className="bg-background text-foreground min-h-screen py-8 md:py-16 font-body">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <Link 
          href={`/menu?tab=${product.category}`}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-8 md:mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Menu</span>
        </Link>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Presentation */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-lg border bg-muted group">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm uppercase py-1 px-3 shadow-md border-none font-semibold">
              {category?.name || product.category}
            </Badge>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-8">
            <div className="border-b pb-6">
              <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground tracking-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary font-headline">
                  {product.price}
                  {product.category === 'cakes' && <span className="text-sm font-normal text-muted-foreground"> / 500g</span>}
                  {product.category === 'chocolates' && <span className="text-sm font-normal text-muted-foreground"> / 250g</span>}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-semibold">
                  Handcrafted To Order
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                {product.description}
              </p>
            </div>

            {/* Product Actions (Quantity & Add to Cart) */}
            <ProductActions product={product} />

            {/* Ingredients & Dietary Info */}
            <div className="space-y-4 pt-6 border-t">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  {details.isEdible ? 'Ingredients' : 'Materials & Style'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {details.ingredients}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">
                  {details.isEdible ? 'Allergen & Dietary Information' : 'Handling & Care'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {details.dietary}
                </p>
              </div>
            </div>

            {/* Premium Commitments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Exquisite Quality</h4>
                  <p className="text-xs text-muted-foreground">{details.bakingTime}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">Custom Design</h4>
                  <p className="text-xs text-muted-foreground">Tailored exactly to your style and event theme</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 md:mt-32 pt-12 border-t">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-10 text-center text-foreground">
              More from {category?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((relatedProd) => (
                <ProductCard key={relatedProd.id} product={relatedProd} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
