import { ShelbyClient } from '@shelby-protocol/sdk/browser';
import { Network } from '@aptos-labs/ts-sdk';

const apiKey = process.env.NEXT_PUBLIC_SHELBY_API_KEY || '';

export const shelbyClient = typeof window !== 'undefined'
  ? new ShelbyClient({
      network: Network.TESTNET,
      apiKey: apiKey,
      // You can also pass the aptos config directly if Shelby SDK supports it, 
      // but apiKey parameter natively does exactly what you pasted under the hood.
      // E.g., it builds: clientConfig: { API_KEY: apiKey }
    })
  : ({} as any);
