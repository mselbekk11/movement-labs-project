// The main functionality of the app lives here.
// It handles the wallet connection, disconnection, authentication and registration.

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
import Spinner from '@/components/spinner';
import { getNonce, verifyWallet, registerWallet } from '@/services/auth';

export default function Register() {
  // Hooks for wallet connection/disconnection
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  // Hook for toast notifications
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

  // Disconnect wallet function
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

  // handle register wallet function - verify wallet ownership and register wallet functionality
  const handleRegister = async () => {
    if (!isConnected || !address) return;
    try {
      setIsRegistering(true);

      // 1. Get nonce and verify wallet ownership
      const nonce = await getNonce(address);
      const verificationMessage = `Sign this message to verify wallet ownership. Nonce: ${nonce}`;
      const verificationSignature = await signMessageAsync({
        message: verificationMessage,
      });

      await verifyWallet({
        address,
        nonce,
        signature: verificationSignature,
        message: verificationMessage,
      });

      // 2. Register wallet
      const timestamp = Date.now();
      const registrationMessage = `Register wallet ${address} at timestamp ${timestamp}`;
      const registrationSignature = await signMessageAsync({
        message: registrationMessage,
      });

      const result = await registerWallet({
        address,
        signature: registrationSignature,
        message: registrationMessage,
        timestamp,
      });

      if (!result.success) {
        toast({
          title: 'Unsuccessful',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Congrats! Registration successful',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error during registration:', error);
      let errorMessage = 'Failed to register wallet';

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
                      <Spinner />
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
