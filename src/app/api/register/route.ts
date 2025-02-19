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

export async function POST(request: Request) {
  try {
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

    const { address, signature, message, timestamp } = await request.json();

    // Verify the signature using viem
    const isValid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Read the existing registrations
    const registrationsPath = path.join(process.cwd(), 'data/registrations.json');
    const fileContent = await fs.readFile(registrationsPath, 'utf-8');
    const registrations = JSON.parse(fileContent);

    // Check if wallet is already registered
    const isRegistered = registrations.some(
      (reg: Registration) => reg.address.toLowerCase() === address.toLowerCase()
    );

    if (isRegistered) {
      return NextResponse.json(
        { message: 'Wallet already registered' },
        { status: 400 }
      );
    }

    // Add new registration
    const newRegistration = {
      walletType: 'EVM',
      address,
      timestamp,
    };

    registrations.push(newRegistration);

    // Write back to file
    await fs.writeFile(
      registrationsPath,
      JSON.stringify(registrations, null, 2)
    );

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
