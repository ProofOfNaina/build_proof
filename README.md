# BuildProof

A professional networking app built on Aptos, with media and documents stored on
[Shelby Protocol](https://docs.shelby.xyz/protocol). Users connect an Aptos
wallet, build a profile, post updates with attached media, browse jobs, and
message each other.

## Stack

- **Next.js 15** (App Router) + React 19 + Tailwind CSS 4
- **Aptos** wallet adapter (Petra and other Ed25519 wallets)
- **Shelby** SDK for blob storage
- **TanStack Query** for data fetching

## Prerequisites

- Node.js 20+
- An Aptos wallet browser extension (Petra) on **the network below**
- An Aptos API key issued for **that same network**

## Network: Shelbynet, not Aptos testnet

The app defaults to `SHELBYNET`. Aptos testnet does not work, and this is not a
configuration you can fix with a different key:

| Endpoint | Result |
| --- | --- |
| `api.testnet.shelby.xyz` (blob RPC) | **NXDOMAIN** — the host does not exist |
| testnet blob indexer (GraphQL) | **403** `Forbidden: Public API is not available for this instance`, with a valid key and `Origin` |
| `api.shelbynet.shelby.xyz` | reachable — answers `401 API key not found` for a testnet key |

The Shelby SDK ships testnet constants, but that deployment isn't live. Uploading
on testnet fails during the pre-flight blob lookup with that 403.

So you need:

1. `NEXT_PUBLIC_SHELBY_API_KEY` issued for **shelbynet** (a testnet key returns
   `API key not found`).
2. Petra pointed at shelbynet — registering blob commitments is an on-chain
   transaction, so the wallet must be on the same chain.
3. Gas and ShelbyUSD storage credit on that account.

`NEXT_PUBLIC_SHELBY_NETWORK` selects the network in one place; the wallet adapter,
the blob read URLs, and the explorer links all derive from it.

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
   NEXT_PUBLIC_SHELBY_API_KEY=your_shelbynet_key_here
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
| `npm run build:check` | Build into `.next-check` — safe while `next dev` is running |
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

## Uploads

Images (PNG, JPEG, GIF, WebP, SVG) and PDFs, up to 10 MB, are stored on Shelby.
Attach one to a post, or upload an avatar (image) or resume (PDF) on your profile.

`useShelbyUpload` drives the SDK primitives directly instead of calling
`useUploadBlobs`, because that hook first asks the blob indexer which blobs
already exist — the endpoint that returns 403 (see above). That pre-check only
exists to avoid re-registering an existing blob, which we sidestep by giving
every upload a unique blob name. The rest of the sequence is identical:

1. Encode the file with erasure coding (WASM, in the browser).
2. Register the commitments on-chain — **the wallet prompts here**.
3. Wait for that transaction to confirm.
4. PUT the data to the Shelby RPC node, reporting real byte progress.

Files are validated (type, non-empty, size) before any of this, so a rejected
file never costs a wallet prompt. The limit is conservative because encoding
holds the whole file in memory.

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
