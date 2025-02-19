// app/api/nonce/route.ts
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { nonceStore } from '../../../lib/nonceStore';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 });
    }
    // Generate a random nonce (16 bytes, as a hex string)
    const nonce = randomBytes(16).toString('hex');
    // Store the nonce using the lowercased address as key
    nonceStore[address.toLowerCase()] = nonce;
    return NextResponse.json({ nonce });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
