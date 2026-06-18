import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link 
      href="#" 
      className="block group outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ease-in-out h-full flex flex-col rounded-lg border">
        <div className="aspect-square relative w-full">
          <Image 
            src={product.imageUrl} 
            alt={product.name} 
            fill 
            style={{objectFit: 'cover'}}
            className="transition-transform duration-500 group-hover:scale-110"
            data-ai-hint={product.imageHint || product.category}
          />
          {product.price && (
            <Badge variant="secondary" className="absolute top-2 right-2 text-sm py-1 px-2 shadow-md bg-background/80 backdrop-blur-sm">
              {product.price}
            </Badge>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-xl tracking-tight">{product.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow py-2">
          <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
        </CardContent>
        <CardFooter className="pt-2 pb-4">
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            View Item
            <ArrowRight className="inline h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ProductCard;