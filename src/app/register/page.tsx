'use client';

import { useState } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect } from '@reown/appkit/react';
import { useSignMessage } from 'wagmi';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { FlickeringGrid } from '@/components/magicui/flickering-grid';
import ScrambleText from '@/components/scramble-text';

export default function Register() {
  // Hooks for wallet connection/disconnection
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  // Wagmi hook for signing messages
  const { signMessageAsync } = useSignMessage({
    mutation: {
      onSuccess(signature) {
        console.log('Signature obtained:', signature);
      },
      onError(error) {
        console.error('Error signing message:', error);
      },
    },
  });

  // Local state for wallet verification process
  const [isRegistering, setIsRegistering] = useState(false);

  // Disconnect resets verification state
  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Disconnected',
        description: 'Your Wallet has been disconnected',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error during disconnection:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  // Update handleRegister to include verification
  const handleRegister = async () => {
    if (!isConnected || !address) return;
    try {
      setIsRegistering(true);

      // 1. First verify wallet ownership
      // Get nonce
      const nonceRes = await fetch('/api/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const nonceData = await nonceRes.json();
      if (!nonceData.nonce) {
        throw new Error('No nonce returned from server.');
      }

      // Sign verification message
      const verificationMessage = `Sign this message to verify wallet ownership. Nonce: ${nonceData.nonce}`;
      const verificationSignature = await signMessageAsync({
        message: verificationMessage,
      });

      // Verify ownership
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          nonce: nonceData.nonce,
          signature: verificationSignature,
          message: verificationMessage,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error('Wallet ownership verification failed');
      }

      // 2. If verified, proceed with registration
      const timestamp = Date.now();
      const registrationMessage = `Register wallet ${address} at timestamp ${timestamp}`;
      const registrationSignature = await signMessageAsync({
        message: registrationMessage,
      });

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          signature: registrationSignature,
          message: registrationMessage,
          timestamp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: 'Success',
        description: 'Congrats! Registration successful',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error during registration:', error);
      let errorMessage = 'Failed to register wallet';

      // Check if the error is a rate limit error
      if (
        error instanceof Error &&
        error.message.includes('Too many requests')
      ) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      }

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

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
      <Card className='w-full max-w-[450px]'>
        {!isConnected ? (
          <div>
            <CardHeader>
              <CardTitle>Register your wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to register
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className='w-full font-semibold' onClick={() => open()}>
                Connect Wallet
              </Button>
            </CardContent>
          </div>
        ) : (
          <div>
            <CardHeader>
              <CardTitle className='mb-2'>Connected Wallet:</CardTitle>
              <ScrambleText text={address ?? ''} />
            </CardHeader>
            <CardContent>
              <div className='flex justify-between gap-4'>
                <Button
                  className='w-full font-semibold'
                  onClick={handleDisconnect}
                >
                  Disconnect Wallet
                </Button>
                <Button
                  className='w-full font-semibold'
                  variant='outline'
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <span className='mr-2'>Registering</span>
                      <svg
                        className='animate-spin h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                      >
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                    </>
                  ) : (
                    'Register Wallet'
                  )}
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </main>
  );
}
