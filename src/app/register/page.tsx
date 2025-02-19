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

import { Button } from '@/components/ui/button';

export default function Register() {
  // Hooks for wallet connection/disconnection
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

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
    await disconnect();
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
        throw new Error(error.message);
      }

      // Registration successful
      console.log('Wallet registered successfully!');
    } catch (error) {
      console.error('Error during registration:', error);
      // You might want to show this error to the user in a more user-friendly way
    }
  };

  return (
    <main className='min-h-screen px-8 py-0 pb-12 flex-1 flex flex-col items-center justify-center'>
      <Card>
        <CardHeader>
          <CardTitle>Register your wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='max-w-4xl flex flex-col gap-4'>
            {!isConnected ? (
              <Button onClick={() => open()}>Connect Wallet</Button>
            ) : (
              <div className='flex-1 space-y-1'>
                <div className='mb-4'>
                  <p className='text-sm font-bold leading-none'>
                    Connected Wallet:
                  </p>
                  <p className='text-sm text-muted-foreground'>{address}</p>
                </div>
                <div className='flex justify-between'>
                  <Button onClick={handleDisconnect}>Disconnect Wallet</Button>
                  <Button variant='outline' onClick={handleRegister}>
                    Register Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
