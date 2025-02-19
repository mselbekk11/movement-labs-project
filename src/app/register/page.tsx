'use client';

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

export default function Register() {
  // Hooks for wallet connection/disconnection
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const { toast } = useToast();

  // useSignMessage hook to request the wallet signature
  const { signMessageAsync } = useSignMessage({
    mutation: {
      onSuccess(signature) {
        console.log('Signature obtained:', signature);
        // Here you could send the signature to your backend for verification
      },
      onError(error) {
        console.error('Error signing message:', error);
      },
    },
  });

  // Function to disconnect the wallet
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

  // Function to trigger a signing request for registration
  const handleRegister = async () => {
    if (!isConnected) return;
    try {
      // Define a message that includes a timestamp for additional security
      const timestamp = Date.now();
      const message = `Register wallet ${address} at timestamp ${timestamp}`;

      const signature = await signMessageAsync({ message });

      // Send the data to our API endpoint
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
      <Card className='w-full max-w-[400px]'>
        {!isConnected ? (
          <div>
            <CardHeader>
              <CardTitle>Register your wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to register
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className='w-full' onClick={() => open()}>
                Connect Wallet
              </Button>
            </CardContent>
          </div>
        ) : (
          <div>
            <CardHeader>
              <CardTitle className='mb-2'>Connected Wallet:</CardTitle>
              <CardDescription>{address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between gap-4'>
                <Button className='w-full' onClick={handleDisconnect}>
                  Disconnect Wallet
                </Button>
                <Button
                  className='w-full'
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
    </main>
  );
}
