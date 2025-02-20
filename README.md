<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). -->

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/mselbekk11/movement-labs-project
```

2. Open the repository in your code editor:

```bash
cd movement-labs-project
```

3. Create a .env file and add the following:

```bash
NEXT_PUBLIC_PROJECT_ID = 6d61173f270460ed65c7cf4c3f47df04
```

4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Please use port 3000 as appkit is configured to use this url.

## How to use

- Click register your Wallet on the homepage, this will take you to the register route
- Click **Connect Wallet** & choose either MetaMask (EVM) or OKX (Movement)
- Click **Register Wallet**
- Confirm signature request
- Confirm registration request
- Wallet data will be added to data/registrations.json

## Wallet Ownership Verification

I have implemented a secure wallet authentication system where users prove they own a cryptocurrency wallet by signing a unique challenge (nonce) with their private key. The server verifies this ownership by checking that the signature could only have come from the claimed wallet address, ensuring that users can't register wallets they don't actually control.

## Preventing Bot / Sybil Registrations

There were many options to choose from and I decided to use a rate limiting system, which tracks requests per IP address. Each API endpoint has different rate limits based on its sensitivity.

- Nonce Generation (/api/nonce):

  - 5 requests per minute per IP
  - Prevents spam of nonce generation

- Signature Verification (/api/verify):

  - 10 requests per minute per IP
  - More lenient since verification might need multiple attempts

- Registration (/api/register):

  - 4 requests per minute per IP
  - Most restrictive because it's the most sensitive operation

- Limitations
  - In-memory storage means rate limits reset on server restart
  - IP-based limiting can be bypassed with proxy networks
  - Doesn't prevent multiple registrations from different wallets controlled by the same entity

## Things I used

- [reown AppKit](https://reown.com/) - open-source solution to integrate wallet connections.
- [wagmi](https://wagmi.sh/) - provides hooks to interact with blockchain networks.
- [ethers.js](https://docs.ethers.org/v6/) - used for cryptographic signature verification of Ethereum wallet signatures.
- [shadcn/ui](https://ui.shadcn.com/) - for styled components.
- [Magic UI](https://magicui.design/) - for the animated background.
- [Motion Primitives](https://motion-primitives.com/) - for the scrambeled wallet text.

## Things I would improve

- In regards to Preventing Bot / Sybil Registrations I would look into more robust solutions like:

  - Proof of Humanity integration
  - Captcha systems
  - Blockchain-based reputation systems
  - More sophisticated rate limiting (e.g. Redis-based)

- In regards to Wallet Ownership Verification, I would not store the nonce in-memory and would look to store it in a persistent database like Redis for example.
