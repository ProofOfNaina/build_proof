'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getShelbyBlobExplorerUrl } from '@shelby-protocol/sdk/browser';
import { useUploadBlobs } from '@shelby-protocol/react';
import { useCallback, useState } from 'react';
import { shelbyClient, shelbyNetwork, shelbyRpcBaseUrl } from '@/lib/shelbyClient';

/** Blob names may not be empty, end in a slash, or exceed 1024 chars (BlobNameSchema). */
const MAX_BLOB_NAME_LENGTH = 1024;

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
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  // `useUploadBlobs` is the wallet-aware path: it encodes the blob, registers the
  // commitments via `signAndSubmitTransaction` (so the wallet prompts), waits for
  // that transaction, then PUTs the data. The raw `client.batchUpload()` cannot be
  // used here — it takes an Aptos `Account` with its own private key, not a
  // connected wallet, and reading `.accountAddress` off the adapter context is
  // what threw "Cannot read properties of undefined".
  // Pass the client explicitly rather than relying on ShelbyClientProvider: that
  // provider is loaded with `ssr: false`, so it isn't mounted during SSR and the
  // context lookup would throw.
  const uploadBlobs = useUploadBlobs({ client: shelbyClient });

  const uploadFile = useCallback(
    async (file: File, path: string) => {
      if (!account) throw new Error('Wallet not connected');
      if (!path || path.endsWith('/') || path.length > MAX_BLOB_NAME_LENGTH) {
        throw new Error('Invalid storage path for upload');
      }

      setError(null);
      setProgress(0);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        // Expiration: 1 year from now, in microseconds.
        const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

        await uploadBlobs.mutateAsync({
          blobs: [{ blobName: path, blobData: data }],
          expirationMicros,
          // The adapter context satisfies WalletAdapterSigner: `account` carries
          // `.address` and `signAndSubmitTransaction` is the adapter's own.
          signer: {
            account: account.address,
            signAndSubmitTransaction: wallet.signAndSubmitTransaction,
          },
        });

        setProgress(1);

        // Both URLs must be built the way the SDK builds them: the blob name is
        // percent-encoded (slashes preserved) and the explorer path is
        // /{network}/account/{address}/blob/{name}.
        const address = account.address.toString();
        const url = `${shelbyRpcBaseUrl}/v1/blobs/${address}/${encodeBlobName(path)}`;
        const explorerUrl = getShelbyBlobExplorerUrl(shelbyNetwork, address, path);

        return { url, explorerUrl };
      } catch (err: any) {
        console.error('Shelby upload error:', err);
        setError(err);
        throw err;
      }
    },
    [account, wallet, uploadBlobs],
  );

  return {
    uploadFile,
    sanitizeFileName,
    isUploading: uploadBlobs.isPending,
    error,
    progress,
  };
}

export { sanitizeFileName };
