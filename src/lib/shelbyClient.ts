import {
  ShelbyClient,
  NetworkToShelbyRPCBaseUrl,
  isShelbyNetwork,
  type ShelbyNetwork,
} from '@shelby-protocol/sdk/browser';
import { Network } from '@aptos-labs/ts-sdk';

// Which Shelby network to talk to.
//
// This is NOT interchangeable with Aptos testnet. Shelby ships testnet constants
// in its SDK, but as of this writing `api.testnet.shelby.xyz` does not resolve
// (NXDOMAIN) and the testnet blob indexer answers 403 "Public API is not
// available for this instance" even with a valid key. Shelbynet is the network
// that is actually up, and it is what the docs call the development network.
//
// Override with NEXT_PUBLIC_SHELBY_NETWORK if that changes.
const configured = process.env.NEXT_PUBLIC_SHELBY_NETWORK;

export const shelbyNetwork: ShelbyNetwork =
  configured && isShelbyNetwork(configured) ? configured : Network.SHELBYNET;

/**
 * Base URL for reading blobs, derived from the selected network rather than
 * hardcoded, so the network setting stays the single source of truth.
 */
export const shelbyRpcBaseUrl = NetworkToShelbyRPCBaseUrl[shelbyNetwork];

// API keys are network-specific, and sending one issued for a different network
// is worse than sending none: shelbynet serves the Aptos node and blob RPC
// anonymously, but answers a mismatched key with a plain-text
// `401 Unauthorized: API key not found`, which the Aptos SDK then tries to parse
// as JSON ("Unexpected token 'U'"). So a key is only used when its network is
// declared and matches the active one.
const rawApiKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY?.trim() || '';
const apiKeyNetwork = process.env.NEXT_PUBLIC_SHELBY_API_KEY_NETWORK?.trim();

export const shelbyApiKey: string | undefined =
  rawApiKey && apiKeyNetwork && isShelbyNetwork(apiKeyNetwork) && apiKeyNetwork === shelbyNetwork
    ? rawApiKey
    : undefined;

if (typeof window !== 'undefined' && rawApiKey && !shelbyApiKey) {
  console.warn(
    `[BuildProof] Ignoring NEXT_PUBLIC_SHELBY_API_KEY: it is not declared for "${shelbyNetwork}". ` +
      `Set NEXT_PUBLIC_SHELBY_API_KEY_NETWORK=${shelbyNetwork} if the key was issued for that network. ` +
      `Sending a key from another network fails every request with "Unauthorized: API key not found".`,
  );
}

export const shelbyClient =
  typeof window !== 'undefined'
    ? new ShelbyClient({
        network: shelbyNetwork,
        // Omitted entirely when there is no matching key — shelbynet is open.
        ...(shelbyApiKey ? { apiKey: shelbyApiKey } : {}),
      })
    : ({} as any);
