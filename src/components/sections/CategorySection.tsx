import type { Category } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface CategorySectionProps {
  category: Category;
}

const CategorySection = ({ category }: CategorySectionProps) => {
  return (
    <section id={category.id} className="py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-8 md:mb-12 text-foreground">
          {category.name}
        </h2>
        {category.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No items in this category yet. Check back soon!</p>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
