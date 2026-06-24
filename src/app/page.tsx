import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ContactForm from '@/components/ContactForm';
import { Clock, MapPin, PhoneCall, ArrowRight, Instagram } from 'lucide-react';

const specialties = [
  {
    id: 'cakes',
    name: 'Artisan Cakes',
    imageUrl: '/images/products/cake_chocolate.jpg',
    description: 'Freshly baked cakes using authentic recipes, featuring classic, premium, and fusion Indian flavors.',
    link: '/menu?tab=cakes'
  },
  {
    id: 'chocolates',
    name: 'Artisan Chocolates',
    imageUrl: '/images/products/choco_chocolate.jpg',
    description: 'Belgian chocolates, dark chocolate truffles, and custom designer chocolates for all gifting occasions.',
    link: '/menu?tab=chocolates'
  },
  {
    id: 'cookies',
    name: 'Gourmet Cookies',
    imageUrl: '/images/products/classic_choco.png',
    description: 'Freshly baked chocolate chip, double chocolate, oatmeal raisin, and peanut butter cookies.',
    link: '/menu?tab=cookies'
  },
  {
    id: 'packing_bouquets',
    name: 'Trouser Packing & Bouquets',
    imageUrl: '/images/products/trousseau_packing1.png',
    description: 'Bespoke trousseau clothing packing and luxury rose or chocolate bouquets to make your gifting sweet and memorable.',
    link: '/menu?tab=packing_bouquets'
  },
  {
    id: 'customization',
    name: 'Custom Orders',
    imageUrl: '/images/products/choco_designer-customised.jpg',
    description: 'Bespoke custom theme cakes and personalized designer chocolate boxes crafted for your special celebrations.',
    link: '/menu?tab=customization'
  }
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 bg-gradient-to-br from-pink-100 via-purple-50 to-white dark:from-pink-950/30 dark:via-purple-950/20 dark:to-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-headline text-foreground tracking-tight leading-tight max-w-4xl mx-auto">
            Make Your Occasions Sweet with <span className="text-primary">Sweet Surprise</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-body">
            Indulge in our exquisite custom cakes, chocolates, and premium gifting packaging. We craft beautiful sweet surprises for your loved ones.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <Link href="/menu">Explore Our Menu</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary/20 hover:bg-primary/5 text-foreground transition-all duration-300">
              <Link href="#contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Specialties/Categories Section */}
      <section id="menu" className="py-20 bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-foreground">
              Our Specialties
            </h2>
            <p className="mt-4 text-muted-foreground">
              Select a category to browse our complete catalog of freshly baked delights and customized gifting packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {specialties.map((item) => (
              <Link key={item.id} href={item.link} className="block group">
                <Card className="overflow-hidden h-full flex flex-col rounded-2xl border shadow-sm group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 ease-in-out">
                  <div className="aspect-video relative w-full overflow-hidden bg-muted">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-headline text-2xl tracking-tight group-hover:text-primary transition-colors">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow py-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                  <CardFooter className="pt-2 pb-6">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 font-semibold flex items-center justify-center">
                      <span>Browse {item.name}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Info & Banner Section */}
      <section className="py-16 bg-accent/30 dark:bg-accent/10 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            {/* Hours */}
            <div className="flex flex-col items-center p-6 bg-background rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-semibold text-lg mb-2">Our Hours</h3>
              <p className="text-sm text-muted-foreground">Tuesday - Sunday: 9:00 AM - 6:00 PM</p>
              <p className="text-xs text-primary font-semibold mt-1">Closed on Mondays</p>
            </div>
            
            {/* Location */}
            <div className="flex flex-col items-center p-6 bg-background rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-semibold text-lg mb-2">Location</h3>
              <p className="text-sm text-muted-foreground">Sweet Surprise, Mumbai, India</p>
              <p className="text-xs text-muted-foreground mt-1">Delivery & Pickup Available</p>
            </div>

            {/* Contact Details & Actions */}
            <div className="flex flex-col items-center p-6 bg-background rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-full text-primary mb-4">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-semibold text-lg mb-2">Get in Touch</h3>
              <p className="text-sm font-semibold text-foreground">Owner: Rinku Adani</p>
              <p className="text-sm text-muted-foreground mt-1">Email: info@sweetsurprise.com</p>
              <div className="mt-4 flex flex-wrap gap-2 w-full justify-center">
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm px-4">
                  <a href="tel:+919825084514">Call Now</a>
                </Button>
                <Button size="sm" variant="outline" asChild className="border-primary/20 hover:bg-primary/5 text-foreground transition-all px-4">
                  <a 
                    href="https://wa.me/919825084514" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4 text-green-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.486 5.355 1.487 5.383 0 9.768-4.381 9.771-9.758.002-2.602-1.01-5.05-2.85-6.893-1.839-1.843-4.285-2.859-6.887-2.86-5.39 0-9.778 4.382-9.782 9.759-.001 2.072.54 4.095 1.566 5.867l-.989 3.612 3.717-.975zM17.486 14.41c-.323-.162-1.913-.943-2.209-1.052-.297-.108-.513-.162-.73.162-.216.324-.838 1.052-1.027 1.267-.19.215-.379.243-.702.08-1.597-.798-2.662-1.396-3.722-3.214-.28-.48-.052-.738.163-.953.193-.193.379-.444.568-.666.19-.22.253-.377.379-.628.127-.25.063-.47-.03-.632-.095-.162-.73-1.758-1.002-2.414-.265-.637-.53-.55-.73-.56-.19-.009-.408-.01-.624-.01-.216 0-.568.08-.865.405-.297.324-1.136 1.111-1.136 2.709 0 1.598 1.163 3.14 1.325 3.356.162.215 2.29 3.497 5.548 4.9.775.334 1.38.533 1.85.682.778.247 1.487.213 2.047.129.624-.093 1.913-.78 2.183-1.534.27-.753.27-1.4.19-1.53-.08-.133-.297-.215-.62-.378z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild className="border-primary/20 hover:bg-primary/5 text-foreground transition-all px-4">
                  <a 
                    href="https://www.instagram.com/sweet_surprise_official_/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1"
                  >
                    <Instagram className="w-4 h-4 text-primary" />
                    <span>Instagram</span>
                  </a>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section with Accordion */}
      <section id="faq" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold font-headline text-center mb-12 text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              
              <AccordionItem value="faq-1" className="border rounded-xl px-4 bg-muted/20 dark:bg-muted/10">
                <AccordionTrigger className="font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Do you offer custom cake orders?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-1 pb-4">
                  Yes, we love creating custom cakes for your special occasions! Please contact us at least one week in advance to discuss your design, flavor preferences, and size requirements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2" className="border rounded-xl px-4 bg-muted/20 dark:bg-muted/10">
                <AccordionTrigger className="font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  What are your delivery options?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-1 pb-4">
                  We offer local delivery within a 15-mile radius of our shop for a flat fee. For larger custom cakes and delicate bouquets, we coordinate dedicated transport.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3" className="border rounded-xl px-4 bg-muted/20 dark:bg-muted/10">
                <AccordionTrigger className="font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  Do you have gluten-free or allergen-friendly options?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-1 pb-4">
                  We offer a selection of gluten-free, dairy-free, and vegan treats. However, please note that our products are prepared in a kitchen that handles wheat, nuts, and dairy, so trace cross-contamination is possible.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4" className="border rounded-xl px-4 bg-muted/20 dark:bg-muted/10">
                <AccordionTrigger className="font-semibold text-foreground hover:no-underline hover:text-primary transition-colors py-4">
                  What is Trousseau Packing and how can I order it?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-1 pb-4">
                  Trousseau (Trouser) packing is our premium gift-wrapping service where we pack clothing, suits, sarees, and accessories into customized, hand-decorated trays and boxes. To order, please contact us via phone or Instagram with your styling preferences and event date.
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-20 bg-muted/30 dark:bg-muted/10 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-bold font-headline text-foreground">
              Contact Us
            </h2>
            <p className="mt-4 text-muted-foreground">
              Have questions or want to inquire about a custom order? Drop us a line and we will get back to you within 24 hours.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
