import Link from 'next/link';

const Logo = () => {
  return (
    <Link href="/" passHref>
      <span className="font-headline text-2xl md:text-3xl font-bold text-primary cursor-pointer select-none">
        Sweet Delights Bakery
      </span>
    </Link>
  );
};

export default Logo;
