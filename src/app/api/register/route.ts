// This file implements a registration API endpoint
// It verifies the wallet's signature and adds the wallet to the registrations list

import { NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit } from '@/lib/rateLimit';

interface Registration {
  walletType: string;
  address: string;
  timestamp: number;
}

// POST Endpoint Handler
export async function POST(request: Request) {
  try {
    // 1. Rate limiting check

    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Rate limit: 4 requests per minute per IP
    if (!rateLimit(ip, 4)) {
      return NextResponse.json(
        { message: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Gets the data from the request body
    const { address, signature, message, timestamp } = await request.json();

    // 2. Verify the signature using viem (double checking ownership)
    // viem is a library for interacting with the Ethereum blockchain
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    // If the signature is invalid, return an error
    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 3. Read the existing registrations
    const registrationsPath = path.join(process.cwd(), 'data/registrations.json');
    const fileContent = await fs.readFile(registrationsPath, 'utf-8');
    const registrations = JSON.parse(fileContent);

    // 4. Checks if wallet is already registered
    const isRegistered = registrations.some(
      (reg: Registration) => reg.address.toLowerCase() === address.toLowerCase()
    );

    if (isRegistered) {
      return NextResponse.json(
        { message: 'Wallet already registered' },
        { status: 400 }
      );
    }

    // 4. If not registered, creates a new registration 
    const newRegistration = {
      walletType: 'EVM',
      address,
      timestamp,
    };

    // 5. Adds the new registration to the registrations array in memory
    registrations.push(newRegistration);

    // 6. Writes the new registration to the JSON file
    await fs.writeFile(
      registrationsPath,
      JSON.stringify(registrations, null, 2)
    );

    // 7. Returns a success or error message to the client
    return NextResponse.json(
      { message: 'Registration successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
