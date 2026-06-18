import CategorySection from '@/components/sections/CategorySection';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const categoriesData: Category[] = [
  {
    id: 'cakes',
    name: 'Artisan Cakes',
    products: [
      { id: 'cake1', name: 'Velvet Fantasy Cake', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'red velvet cake', category: 'cakes', description: 'A stunning red velvet creation with smooth cream cheese frosting, perfect for celebrations.', price: '$45' },
      { id: 'cake2', name: 'Midnight Chocolate Dream', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'chocolate cake', category: 'cakes', description: 'Decadent dark chocolate layers with a rich ganache. A chocolate lover\'s paradise.', price: '$50' },
      { id: 'cake3', name: 'Lemon Sunshine Cake', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'lemon cake', category: 'cakes', description: 'Zesty lemon cake with a light citrus glaze, bringing sunshine to your plate.', price: '$40' },
      { id: 'cake4', name: 'Berry Bliss Cheesecake', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'berry cheesecake', category: 'cakes', description: 'Creamy cheesecake topped with a medley of fresh, seasonal berries.', price: '$55' },
    ],
  },
  {
    id: 'cookies',
    name: 'Gourmet Cookies',
    products: [
      { id: 'cookie1', name: 'Classic Choco Chip', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'chocolate chip cookie', category: 'cookies', description: 'The timeless favorite, baked to golden perfection with generous chocolate chips.', price: '$3 each' },
      { id: 'cookie2', name: 'Oatmeal Raisin Comfort', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'oatmeal raisin cookie', category: 'cookies', description: 'Hearty oatmeal cookie with plump raisins and a hint of cinnamon.', price: '$3 each' },
      { id: 'cookie3', name: 'Peanut Butter Delight', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'peanut butter cookie', category: 'cookies', description: 'Rich and nutty peanut butter cookies, soft and chewy.', price: '$3.50 each' },
      { id: 'cookie4', name: 'Double Chocolate Indulgence', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'double chocolate cookie', category: 'cookies', description: 'For extreme chocolate lovers, packed with cocoa and chocolate chunks.', price: '$4 each' },
    ],
  },
  {
    id: 'pastries',
    name: 'Exquisite Pastries',
    products: [
      { id: 'pastry1', name: 'Almond Croissant', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'almond croissant', category: 'pastries', description: 'Flaky croissant filled with rich almond cream and topped with sliced almonds.', price: '$5' },
      { id: 'pastry2', name: 'Fruit Danish Delight', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'fruit danish', category: 'pastries', description: 'Buttery danish pastry with a creamy custard and fresh seasonal fruits.', price: '$4.50' },
      { id: 'pastry3', name: 'Cinnamon Swirl Bun', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'cinnamon bun', category: 'pastries', description: 'Soft and sweet cinnamon bun with a luscious cream cheese glaze.', price: '$4' },
      { id: 'pastry4', name: 'Éclair Perfection', imageUrl: 'https://placehold.co/400x400.png', imageHint: 'chocolate eclair', category: 'pastries', description: 'Classic French éclair filled with vanilla pastry cream and topped with chocolate.', price: '$5.50' },
    ],
  },
];

export default function Home() {
  return (
    <>
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-pink-100 via-purple-50 to-white dark:from-pink-900/30 dark:via-purple-900/20 dark:to-background">
        <div className="absolute inset-0 opacity-30">
          {/* Decorative background elements if desired, e.g. subtle pattern */}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline text-primary tracking-tight">
            Welcome to Sweet Delights Bakery
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
            Indulge in our heavenly selection of freshly baked cakes, cookies, and pastries, crafted with passion and the finest ingredients.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="#menu">Explore Our Menu</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <div id="menu" className="pt-1"> {/* Anchor for menu link */}
        {categoriesData.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>

      <section id="faq" className="py-16 bg-muted/30 dark:bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-10 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <details className="p-4 bg-background rounded-lg shadow group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
                Do you offer custom cake orders?
                <span className="text-primary group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <p className="mt-2 text-muted-foreground">
                Yes, we love creating custom cakes for your special occasions! Please contact us at least one week in advance to discuss your design and requirements.
              </p>
            </details>
            <details className="p-4 bg-background rounded-lg shadow group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
                What are your bakery hours?
                <span className="text-primary group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <p className="mt-2 text-muted-foreground">
                Our bakery is open Tuesday to Sunday, from 9:00 AM to 6:00 PM. We are closed on Mondays.
              </p>
            </details>
            <details className="p-4 bg-background rounded-lg shadow group">
              <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-foreground">
                Do you have gluten-free options?
                <span className="text-primary group-open:rotate-180 transition-transform duration-300">▼</span>
              </summary>
              <p className="mt-2 text-muted-foreground">
                We offer a selection of gluten-free treats. Please ask our staff or check our menu for available gluten-free items. While we take precautions, we cannot guarantee a completely allergen-free environment.
              </p>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
