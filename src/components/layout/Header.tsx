'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingCart, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { user, cart, logout } = useApp();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <>
      <Button variant="ghost" asChild className={inSheet ? "w-full justify-start" : ""}>
        <Link href="/">Home</Link>
      </Button>
      <Button variant="ghost" asChild className={inSheet ? "w-full justify-start" : ""}>
        <Link href="/menu">Menu</Link>
      </Button>
      <Button variant="ghost" asChild className={inSheet ? "w-full justify-start" : ""}>
        <Link href="/#contact">Contact Us</Link>
      </Button>
      {user?.isAdmin && (
        <Button variant="ghost" asChild className={inSheet ? "w-full justify-start text-primary" : "text-primary"}>
          <Link href="/admin" className="flex items-center space-x-1">
            <LayoutDashboard className="w-4 h-4 mr-1" />
            <span>Admin Panel</span>
          </Link>
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <NavLinks />
        </nav>

        {/* Actions (Cart & Auth) */}
        <div className="flex items-center space-x-2">
          {/* Cart Icon */}
          <Button variant="ghost" size="icon" asChild className="relative mr-2">
            <Link href="/cart" aria-label="Shopping Cart">
              <ShoppingCart className="h-5.5 w-5.5 text-foreground" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background rounded-full">
                  {cartItemCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* User Auth Info */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Hi, <span className="font-semibold text-foreground">{user.name}</span>
                </span>
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center space-x-1 border-primary/20 text-foreground hover:bg-primary/5">
                  <LogOut className="w-3.5 h-3.5 mr-1 text-primary" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 pt-6">
                  {user && (
                    <div className="px-3 py-2 bg-muted/40 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground">Logged in as:</p>
                      <p className="font-bold text-foreground mt-0.5">{user.name}</p>
                    </div>
                  )}
                  <NavLinks inSheet={true} />
                  <div className="border-t pt-4">
                    {user ? (
                      <Button variant="outline" className="w-full justify-start border-primary/20 text-foreground hover:bg-primary/5" onClick={logout}>
                        <LogOut className="w-4 h-4 mr-2 text-primary" />
                        <span>Logout</span>
                      </Button>
                    ) : (
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
