'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { getShelbyBlobExplorerUrl } from '@shelby-protocol/sdk/browser';
import { useCallback, useState } from 'react';
import { shelbyClient } from '@/lib/shelbyClient';

/** Blob names may not be empty, end in a slash, or exceed 1024 chars (BlobNameSchema). */
const MAX_BLOB_NAME_LENGTH = 1024;

/** Read endpoint for a stored blob. Mirrors the SDK's `/v1/blobs/{account}/{name}`. */
const SHELBY_RPC_BASE_URL = 'https://api.testnet.shelby.xyz/shelby';

/** Percent-encodes a blob name for a URL path while leaving its slashes intact. */
function encodeBlobName(blobName: string): string {
  return encodeURIComponent(blobName).replace(/%2F/g, '/');
}

/** Strips characters that would make an unusable blob name out of a filename. */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
}

export function useShelbyUpload() {
  const wallet = useWallet();
  const { account } = wallet;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File, path: string) => {
      if (!account) throw new Error('Wallet not connected');
      if (!path || path.endsWith('/') || path.length > MAX_BLOB_NAME_LENGTH) {
        throw new Error('Invalid storage path for upload');
      }

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

        // Both URLs must be built the way the SDK builds them: the blob name is
        // percent-encoded (slashes preserved) and the explorer path is
        // /{network}/account/{address}/blob/{name}.
        const address = account.address.toString();
        const url = `${SHELBY_RPC_BASE_URL}/v1/blobs/${address}/${encodeBlobName(path)}`;
        const explorerUrl = getShelbyBlobExplorerUrl(Network.TESTNET, address, path);

        setIsPending(false);
        return { url, explorerUrl };
      } catch (err: any) {
        console.error('Shelby upload error:', err);
        setError(err);
        setIsPending(false);
        throw err;
      }
    },
    [account, wallet],
  );

  return {
    uploadFile,
    sanitizeFileName,
    isUploading: isPending,
    error,
    progress,
  };
}

export { sanitizeFileName };
