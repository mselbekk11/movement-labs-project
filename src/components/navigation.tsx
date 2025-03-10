import Link from 'next/link';
import Logo from '@/components/logo';
export default function Navigation() {
  return (
    <nav className='flex items-center justify-center h-[10vh] relative z-50'>
      <Link href='/'>
        <Logo />
      </Link>
    </nav>
  );
}
