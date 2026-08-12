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
- No API key required — see below before setting one

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

### Setting up a wallet for shelbynet

Shelbynet is **its own chain** — the docs describe it as "isolated from the Aptos
mainnet, Aptos testnet, and Aptos devnet". A wallet left on Aptos testnet will
still sign and submit, but to *testnet*, and the transaction then never appears
on shelbynet. That surfaces as
`Transaction not found by Transaction hash(0x…)` while the app waits for a
confirmation that will never come. The app now blocks an upload up-front when the
wallet is on the wrong network rather than letting that happen.

1. **Add shelbynet to Petra** as a custom network:
   - Node URL: `https://api.shelbynet.shelby.xyz/v1`
   - Chain ID: `118`
2. **Fund the account with both tokens.** Per the Shelby CLI docs an upload needs
   *both*:
   - **APT** — gas for the on-chain blob registration
   - **ShelbyUSD** — payment for the storage operation

   The profile page has a **Get shelbynet test tokens** button that requests both
   from the faucets. (Reads use micropayment channels; writes do not, so no
   payment session is needed to upload.)

`NEXT_PUBLIC_SHELBY_NETWORK` selects the network in one place; the wallet adapter,
the blob read URLs, and the explorer links all derive from it.

### You probably do not want an API key

Shelbynet serves both the Aptos node and the blob RPC **anonymously**, and a key
issued for another network is worse than no key at all:

| Request | No key | Testnet key |
| --- | --- | --- |
| `api.shelbynet.shelby.xyz/v1` (Aptos node) | `200` JSON | `401 Unauthorized: API key not found` (text/plain) |
| `api.shelbynet.shelby.xyz/shelby/v1/blobs/…` | `404 Blob not found` (correct) | same `401` |

That 401 body is plain text, but the Aptos SDK parses responses as JSON, so it
surfaces as `Unexpected token 'U', "Unauthoriz"... is not valid JSON` — an error
that says nothing about the real cause.

Because of that, `NEXT_PUBLIC_SHELBY_API_KEY` is only used when
`NEXT_PUBLIC_SHELBY_API_KEY_NETWORK` names the network it was issued for and that
matches the active network. Otherwise it is ignored and a console warning
explains why. Leave both blank to run keyless on shelbynet.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`. Every value can stay blank — shelbynet
   works without an API key, and the network defaults to shelbynet.

   If you do set `NEXT_PUBLIC_SHELBY_API_KEY`, it is `NEXT_PUBLIC_`, so it is
   **embedded in the client bundle and publicly visible**. Restrict it by domain
   and rate limit it; never put a secret-bearing key here. And read the API key
   section above first — a key for the wrong network breaks every request.

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

`useShelbyUpload` delegates to the SDK's `useUploadBlobs`, which runs the whole
write path from Shelby's architecture docs:

1. Encode the file with erasure coding (WASM, in the browser).
2. Register the blob on-chain — **the wallet prompts here**.
3. Upload the chunksets to an RPC node, which distributes them to storage providers.
4. Commit the blob on-chain to make it durable — **the wallet prompts again**.

So expect **two** wallet prompts per upload.

### Keep the SDK current

The on-chain contract and the SDK move together, and a stale SDK fails in ways
that point away from the real cause. On `@shelby-protocol/sdk@0.2.4` the wallet
rejected every upload at simulation with:

> Simulation error — Type mismatch for argument 2, expected 'string'

`register_multiple_blobs` takes 8 parameters on Aptos testnet but 11 on
shelbynet — the extra two being `Option<String>` at positions 1 and 2 — and the
old SDK only ever built the 8-parameter form. Upgrading to 0.7.1 (and
`@shelby-protocol/react` to 4.1.0) fixed it. If uploads start failing at
simulation, compare the deployed ABI against what the SDK builds:

```bash
curl -s https://api.shelbynet.shelby.xyz/v1/accounts/0x85fdb9a176ab8ef1d9d9c1b60d60b3924f0800ac1de1cc2085fb0b8bb4988e6a/module/blob_metadata
```

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
