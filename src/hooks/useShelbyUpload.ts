'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { shelbyClient } from '@/lib/shelbyClient';

export function useShelbyUpload() {
  const wallet = useWallet();
  const { account } = wallet;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File, path: string) => {
    if (!account) throw new Error('Wallet not connected');

    setIsPending(true);
    setError(null);
    try {
      // Convert file to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Upload with Shelby
      // Expiration: 1 year from now in microseconds
      const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

      await shelbyClient.batchUpload({
        blobs: [
          {
            blobName: path,
            blobData: data,
          },
        ],
        expirationMicros,
        signer: wallet as any,
      });

      // Construct Shelby URL
      // https://api.testnet.shelby.xyz/shelby/v1/blobs/{account}/{blobName}
      const url = `https://api.testnet.shelby.xyz/shelby/v1/blobs/${account.address.toString()}/${path}`;
      const explorerUrl = `https://explorer.shelby.xyz/blob/${account.address.toString()}/${path}?network=testnet`;
      
      setIsPending(false);
      return { url, explorerUrl };
    } catch (err: any) {
      console.error('Shelby upload error:', err);
      setError(err);
      setIsPending(false);
      throw err;
    }
  }, [account, wallet]);

  return { 
    uploadFile, 
    isUploading: isPending, 
    error, 
    progress 
  };
}
