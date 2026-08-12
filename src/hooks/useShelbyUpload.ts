'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getShelbyBlobExplorerUrl } from '@shelby-protocol/sdk/browser';
import { useUploadBlobs } from '@shelby-protocol/react';
import { useCallback, useEffect, useState } from 'react';
import { shelbyClient, shelbyNetwork, shelbyRpcBaseUrl } from '@/lib/shelbyClient';
import { detectMediaKind, validateUpload, type MediaKind } from '@/lib/uploadFiles';

/** Blob names may not be empty, end in a slash, or exceed 1024 chars (BlobNameSchema). */
const MAX_BLOB_NAME_LENGTH = 1024;

/** Percent-encodes a blob name for a URL path while leaving its slashes intact. */
function encodeBlobName(blobName: string): string {
  return encodeURIComponent(blobName).replace(/%2F/g, '/');
}

export type UploadStage = 'idle' | 'reading' | 'uploading' | 'done';

export interface UploadResult {
  url: string;
  explorerUrl: string;
  kind: MediaKind;
  blobName: string;
  size: number;
}

const STAGE_LABELS: Record<UploadStage, string> = {
  idle: '',
  reading: 'Reading file…',
  // The SDK drives encode -> register -> chunkset upload -> commit internally,
  // prompting the wallet twice (once to register, once to commit).
  uploading: 'Confirm in your wallet…',
  done: 'Done',
};

/**
 * Uploads a file to Shelby using the connected wallet.
 *
 * Delegates to the SDK's `useUploadBlobs`, which runs the whole flow: erasure
 * coding, on-chain registration, chunkset upload, and the on-chain commit that
 * makes the blob durable. Expect **two** wallet prompts — register and commit.
 *
 * Earlier versions of this hook hand-rolled that sequence to avoid the SDK's
 * blob-indexer pre-check, which answered 403. That is no longer necessary:
 * the current SDK does not query the indexer during an upload, and the newer
 * on-chain contract requires a blob UID that is only published on the register
 * transaction's event — mechanics best left to the library.
 */
export function useShelbyUpload() {
  const wallet = useWallet();
  const { account, network } = wallet;
  const [error, setError] = useState<Error | null>(null);
  const [stage, setStage] = useState<UploadStage>('idle');

  const uploadBlobs = useUploadBlobs({ client: shelbyClient });

  // Shelbynet is a separate chain — the docs call it "isolated from the Aptos
  // mainnet, Aptos testnet, and Aptos devnet". A wallet on another chain will
  // happily sign and submit to *its* chain, and the transaction then never
  // appears on the one we poll ("Transaction not found by Transaction hash").
  //
  // Compared by chain id, not network name: a wallet configured with shelbynet
  // as a *custom* network reports its name as "custom" while being the very
  // chain we want. The id is the authoritative identity; the name is a label.
  const [expectedChainId, setExpectedChainId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    shelbyClient.coordination?.aptos
      ?.getChainId?.()
      .then((id: number) => {
        if (!cancelled) setExpectedChainId(id);
      })
      .catch(() => {
        // Leave it unknown: an unreachable node shouldn't block uploads on a
        // guess about which chain the wallet is on.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const walletNetwork = network?.name;
  const walletChainId = network?.chainId;
  const wrongNetwork =
    expectedChainId !== null && walletChainId !== undefined && walletChainId !== expectedChainId;

  const uploadFile = useCallback(
    async (file: File, blobName: string, allowed?: MediaKind[]): Promise<UploadResult> => {
      if (!account) throw new Error('Wallet not connected');

      if (wrongNetwork) {
        throw new Error(
          `Your wallet is on chain ${walletChainId} but this app stores files on ${shelbyNetwork} ` +
            `(chain ${expectedChainId}). These are separate chains, so a transaction signed on ` +
            `chain ${walletChainId} would never appear on ${shelbyNetwork}. Switch networks in ` +
            `your wallet and try again.`,
        );
      }

      const rejection = validateUpload(file, allowed);
      if (rejection) throw new Error(rejection);

      if (!blobName || blobName.endsWith('/') || blobName.length > MAX_BLOB_NAME_LENGTH) {
        throw new Error('Invalid storage path for upload');
      }

      const kind = detectMediaKind(file);
      if (!kind) throw new Error(`Unsupported file type: ${file.name}`);

      setError(null);

      try {
        setStage('reading');
        const blobData = new Uint8Array(await file.arrayBuffer());

        setStage('uploading');
        const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

        await uploadBlobs.mutateAsync({
          blobs: [{ blobName, blobData }],
          expirationMicros,
          // The adapter context satisfies WalletAdapterSigner: `account` carries
          // `.address` and `signAndSubmitTransaction` is the adapter's own.
          signer: {
            account: account.address,
            signAndSubmitTransaction: wallet.signAndSubmitTransaction,
          },
        });

        setStage('done');

        // Built the way the SDK builds them: the blob name is percent-encoded
        // (slashes preserved) and the explorer path is
        // /{network}/account/{address}/blob/{name}.
        const owner = account.address.toString();
        return {
          url: `${shelbyRpcBaseUrl}/v1/blobs/${owner}/${encodeBlobName(blobName)}`,
          explorerUrl: getShelbyBlobExplorerUrl(shelbyNetwork, owner, blobName),
          kind,
          blobName,
          size: blobData.length,
        };
      } catch (err: any) {
        console.error('Shelby upload error:', err);
        setStage('idle');
        setError(err);
        throw err;
      }
    },
    [account, wallet, wrongNetwork, walletChainId, expectedChainId, uploadBlobs],
  );

  return {
    uploadFile,
    isUploading: stage !== 'idle' && stage !== 'done',
    stage,
    stageLabel: STAGE_LABELS[stage],
    // The SDK's upload does not surface byte progress on the wallet path, so
    // this stays 0 rather than showing a number that never moves.
    progress: 0,
    error,
    /** True when the wallet is connected to a different chain than Shelby. */
    wrongNetwork,
    walletNetwork,
    walletChainId,
    expectedChainId,
    requiredNetwork: shelbyNetwork,
  };
}
