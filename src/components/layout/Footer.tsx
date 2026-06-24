import Link from 'next/link';
import { Facebook, Instagram, Twitter, Phone, HelpCircle } from 'lucide-react';
import Logo from '@/components/Logo';

const Footer = () => {
  return (
    <footer id="contact" className="bg-muted/50 text-muted-foreground py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm">
              Handcrafted delights baked with love and the finest ingredients.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-headline">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">Menu</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" /> FAQs
                </Link>
              </li>
               <li>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground font-headline">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-foreground font-semibold">
                Owner: Rinku Adani
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <a href="tel:+919825084514" className="hover:text-primary transition-colors">+91 98250 84514</a>
              </li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <a 
                href="https://www.instagram.com/sweet_surprise_official_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://wa.me/919825084514" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp" 
                className="text-muted-foreground hover:text-green-500 transition-colors"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.486 5.355 1.487 5.383 0 9.768-4.381 9.771-9.758.002-2.602-1.01-5.05-2.85-6.893-1.839-1.843-4.285-2.859-6.887-2.86-5.39 0-9.778 4.382-9.782 9.759-.001 2.072.54 4.095 1.566 5.867l-.989 3.612 3.717-.975zM17.486 14.41c-.323-.162-1.913-.943-2.209-1.052-.297-.108-.513-.162-.73.162-.216.324-.838 1.052-1.027 1.267-.19.215-.379.243-.702.08-1.597-.798-2.662-1.396-3.722-3.214-.28-.48-.052-.738.163-.953.193-.193.379-.444.568-.666.19-.22.253-.377.379-.628.127-.25.063-.47-.03-.632-.095-.162-.73-1.758-1.002-2.414-.265-.637-.53-.55-.73-.56-.19-.009-.408-.01-.624-.01-.216 0-.568.08-.865.405-.297.324-1.136 1.111-1.136 2.709 0 1.598 1.163 3.14 1.325 3.356.162.215 2.29 3.497 5.548 4.9.775.334 1.38.533 1.85.682.778.247 1.487.213 2.047.129.624-.093 1.913-.78 2.183-1.534.27-.753.27-1.4.19-1.53-.08-.133-.297-.215-.62-.378z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sweet Surprise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
