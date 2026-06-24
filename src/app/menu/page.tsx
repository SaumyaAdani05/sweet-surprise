'use client';

import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import ProductCard from '@/components/ui/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MenuPage() {
  const { categories } = useApp();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  
  // Validate tab parameter or fallback to 'cakes'
  const validTabs = ['cakes', 'chocolates', 'cookies', 'packing_bouquets'];
  const activeTab = tab && validTabs.includes(tab) ? tab : 'cakes';

  return (
    <div className="bg-background min-h-screen py-12 md:py-20 font-body">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground tracking-tight">
            Our Menu & Services
          </h1>
          <p className="mt-4 text-muted-foreground">
            Browse our wide selection of gourmet treats and personalized packaging options, crafted to bring sweetness to your occasions.
          </p>
        </div>

        {/* Tabbed Categories */}
        <Tabs defaultValue={activeTab} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="grid w-full max-w-3xl grid-cols-2 md:grid-cols-4 bg-muted/60 p-1 rounded-xl h-auto gap-1 border">
              <TabsTrigger value="cakes" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
                Cakes
              </TabsTrigger>
              <TabsTrigger value="chocolates" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
                Chocolates
              </TabsTrigger>
              <TabsTrigger value="cookies" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
                Cookies
              </TabsTrigger>
              <TabsTrigger value="packing_bouquets" className="rounded-lg py-2.5 text-sm font-semibold transition-all">
                Packing & Bouquets
              </TabsTrigger>
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="focus-visible:outline-none mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {category.products.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    No items in this section yet. Check back soon!
                  </div>
                ) : (
                  category.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
      </div>
    </div>
  );
}
