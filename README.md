# BuildProof

A professional networking app built on Aptos, with media and documents stored on
[Shelby Protocol](https://docs.shelby.xyz/protocol). Users connect an Aptos
wallet, build a profile, post updates with attached media, browse jobs, and
message each other.

## Stack

- **Next.js 15** (App Router) + React 19 + Tailwind CSS 4
- **Aptos** wallet adapter (Petra and other Ed25519 wallets), testnet
- **Shelby** SDK for blob storage
- **TanStack Query** for data fetching

## Prerequisites

- Node.js 20+
- An Aptos wallet browser extension (Petra) on **testnet**
- An Aptos API key with Shelby access

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

   The repo ships an `.npmrc` with `legacy-peer-deps=true`: `@shelby-protocol/react`
   declares a peer of `@shelby-protocol/sdk@0.2.3` while the app runs 0.2.4.
   Remove it once those packages agree on a version.

2. Copy `.env.example` to `.env.local` and set your key:

   ```
   NEXT_PUBLIC_SHELBY_API_KEY=your_key_here
   ```

   This key is `NEXT_PUBLIC_`, so it is **embedded in the client bundle and
   publicly visible**. Restrict it by domain and rate limit at the Aptos console;
   never put a secret-bearing key here.

3. Run the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:auth` | End-to-end API auth checks (needs a server running) |

## Authentication

API writes are authenticated by wallet signature, not by a claimed address.

1. The client signs a JSON payload (`domain`, `wallet`, `timestamp`) plus a random
   nonce with the connected wallet.
2. `POST /api/session` verifies that signature — checking the domain, freshness,
   nonce reuse, that the public key derives to the claimed address, and the
   Ed25519 signature itself — then issues an opaque bearer token (30 min).
3. Every other authenticated route takes `Authorization: Bearer <token>`.

Sessions exist because the messaging view polls every few seconds; signing per
request would prompt the wallet on every poll. Only Ed25519 wallets are
supported — multi-key and keyless accounts are rejected explicitly.

To verify the whole flow against a running server:

```bash
npm run test:auth
```

It generates throwaway keypairs and asserts that forged authorship, replayed
signatures, expired signatures, cross-wallet profile writes, and third-party
reads of a private conversation are all rejected.

## Data storage

`src/lib/db.ts` is an **in-process mock store**, not a database. Data is lost on
restart and cannot be shared across instances. Replace it with a real database
before deploying; the API routes only depend on the exported `db` interface.

## Known limitations

- Notifications are static sample data — there is no notifications backend.
- Post likes and comment counts are display-only.
- Connection requests ("Connect" buttons) are not implemented.
- Blob reads go to the Shelby RPC endpoint without an API key, since the URL is
  used directly as an `<img>`/link target. Private or metered blobs will not load
  this way.
- `@next/next/no-img-element` is disabled. Every image here is remote and either
  an SVG (which the Next optimizer refuses without `dangerouslyAllowSVG`) or a
  Shelby blob, so `next/image` would add no optimization — and using it on the
  SVG avatars actively broke them.
