'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';

export default function Home() {
  return (
    <main className='h-full px-8 py-0 pb-12 flex-1 flex flex-col items-center justify-center relative z-10'>
      <FlickeringGrid
        className='fixed inset-0 -z-10 w-screen h-screen'
        squareSize={4}
        gridGap={6}
        color='#6B7280'
        maxOpacity={0.1}
        flickerChance={0.1}
      />
      <Link href='/register'>
        <Button className='font-semibold'>Register your Wallet</Button>
      </Link>
    </main>
  );
}

// this page contains the button which when clicked uses
// nexts link component which is a static route to my register page
