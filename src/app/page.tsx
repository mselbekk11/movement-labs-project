'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className='min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center justify-center'>
      <h1 className='text-2xl font-bold'>Movement Labs</h1>
      <Link href='/register'>
        <button>Register your Wallet</button>
      </Link>
    </main>
  );
}
