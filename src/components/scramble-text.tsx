'use client';

import { TextScramble } from '@/components/ui/text-scramble';
import { useEffect, useState } from 'react';

export default function ScrambleText({ text }: { text: string }) {
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(false);
      // Small delay to ensure the animation can restart
      setTimeout(() => setTrigger(true), 100);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TextScramble trigger={trigger} className='font-mono text-sm uppercase'>
      {text}
    </TextScramble>
  );
}
