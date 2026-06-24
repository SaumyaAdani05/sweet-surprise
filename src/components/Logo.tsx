import Link from 'next/link';
import Image from 'next/image';

const Logo = () => {
  return (
    <Link href="/" className="flex items-center space-x-2 select-none group">
      <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300">
        <Image
          src="/images/logo.png"
          alt="Sweet Surprise Logo"
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <span className="font-headline text-xl md:text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
        Sweet <span className="text-primary">Surprise</span>
      </span>
    </Link>
  );
};

export default Logo;
