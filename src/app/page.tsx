'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className='h-full px-8 py-0 pb-12 flex-1 flex flex-col items-center justify-center'>
      {/* <h1 className='text-2xl font-bold'>Welcome to Movement Labs</h1> */}
      <Link href='/register'>
        <Button>Register your Wallet</Button>
      </Link>
    </main>
  );
}
