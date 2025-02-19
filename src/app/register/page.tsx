'use client';

import { useEffect, useState } from 'react';
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
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Disconnect resets verification state
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setVerified(false);
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

  // Challenge–response verification on wallet connection
  useEffect(() => {
    async function verifyOwnership() {
      if (isConnected && address && !verified) {
        try {
          setVerifying(true);
          setVerificationError('');
          // 1. Request a nonce from the backend
          const nonceRes = await fetch('/api/nonce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });
          const nonceData = await nonceRes.json();
          if (!nonceData.nonce) {
            throw new Error('No nonce returned from server.');
          }
          const nonce = nonceData.nonce;

          // Add a small delay to ensure nonce is stored
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // 2. Construct the message that includes the nonce
          const message = `Sign this message to verify wallet ownership. Nonce: ${nonce}`;
          // 3. Prompt the user to sign the message
          const signature = await signMessageAsync({ message });
          // 4. Send the signature, nonce, and message to your verification endpoint
          const verifyRes = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address,
              nonce,
              signature,
              message,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setVerified(true);
            toast({
              title: 'Wallet Verified',
              description: 'Your wallet ownership has been verified.',
              variant: 'default',
            });
          } else {
            throw new Error(verifyData.message || 'Verification failed.');
          }
        } catch (error: Error | unknown) {
          console.error('Verification error:', error);
          setVerificationError(
            error instanceof Error ? error.message : 'Unknown error'
          );
          toast({
            title: 'Verification Error',
            description:
              error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        } finally {
          setVerifying(false);
        }
      }
    }
    verifyOwnership();
  }, [isConnected, address, verified, signMessageAsync, toast]);

  // The registration function remains unchanged
  const handleRegister = async () => {
    if (!isConnected) return;
    try {
      // Define a message that includes a timestamp for additional security
      const timestamp = Date.now();
      const message = `Register wallet ${address} at timestamp ${timestamp}`;
      const signature = await signMessageAsync({ message });

      // Send the data to our API endpoint for registration
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
          timestamp,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.message === 'Wallet already registered') {
          toast({
            title: 'Registration Unsuccessful',
            description: 'Wallet already registered',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
        return;
      }

      // Registration successful
      toast({
        title: 'Success',
        description: 'Congrats! Registration successful',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to register wallet',
        variant: 'destructive',
      });
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
                >
                  Register Wallet
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
      <Card className='w-full max-w-[450px] mt-4'>
        <CardHeader>
          {!verified && (
            <CardTitle className='text-yellow-600'>
              {verifying
                ? 'Verifying wallet ownership...'
                : verificationError
                ? `Verification error: ${verificationError}`
                : 'Wallet not verified'}
            </CardTitle>
          )}
          {verified && (
            <CardTitle className='text-green-600'>Wallet Verified!</CardTitle>
          )}
        </CardHeader>
      </Card>
    </main>
  );
}
