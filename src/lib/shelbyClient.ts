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

const apiKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';

export const shelbyClient =
  typeof window !== 'undefined'
    ? new ShelbyClient({
        network: shelbyNetwork,
        apiKey,
      })
    : ({} as any);
