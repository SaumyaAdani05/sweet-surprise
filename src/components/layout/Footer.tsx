import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, HelpCircle } from 'lucide-react';
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
                <Link href="#menu" className="hover:text-primary transition-colors">Menu</Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-primary transition-colors flex items-center">
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
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                <a href="mailto:info@sweetdelights.com" className="hover:text-primary transition-colors">info@sweetdelights.com</a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">(123) 456-7890</a>
              </li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Sweet Delights Bakery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
