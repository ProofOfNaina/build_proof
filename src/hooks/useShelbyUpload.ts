'use client';

import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import {
  createDefaultErasureCodingProvider,
  expectedTotalChunksets,
  generateCommitments,
  getShelbyBlobExplorerUrl,
  ShelbyBlobClient,
  type PutBlobProgress,
} from '@shelby-protocol/sdk/browser';
import { useCallback, useState } from 'react';
import { shelbyClient, shelbyNetwork, shelbyRpcBaseUrl } from '@/lib/shelbyClient';
import {
  detectMediaKind,
  validateUpload,
  type MediaKind,
} from '@/lib/uploadFiles';

/** Blob names may not be empty, end in a slash, or exceed 1024 chars (BlobNameSchema). */
const MAX_BLOB_NAME_LENGTH = 1024;

/** Percent-encodes a blob name for a URL path while leaving its slashes intact. */
function encodeBlobName(blobName: string): string {
  return encodeURIComponent(blobName).replace(/%2F/g, '/');
}

export type UploadStage =
  | 'idle'
  | 'reading'
  | 'encoding'
  | 'awaiting-signature'
  | 'confirming'
  | 'uploading'
  | 'done';

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
  encoding: 'Encoding…',
  'awaiting-signature': 'Confirm in your wallet…',
  confirming: 'Confirming transaction…',
  uploading: 'Uploading…',
  done: 'Done',
};

/**
 * Uploads a file to Shelby using the connected wallet.
 *
 * This drives the SDK primitives directly rather than calling `useUploadBlobs`,
 * because that hook first queries the blob indexer to see which blobs already
 * exist — and that endpoint answers 403 "Public API is not available for this
 * instance". The pre-check only exists to skip re-registering an existing blob,
 * which we avoid instead by generating a unique blob name per upload.
 *
 * The sequence is otherwise identical to the SDK's: encode with erasure coding,
 * register the commitments on-chain (the wallet prompts here), wait for that
 * transaction, then PUT the data to the RPC node.
 */
export function useShelbyUpload() {
  const wallet = useWallet();
  const { account } = wallet;
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<UploadStage>('idle');

  const uploadFile = useCallback(
    async (file: File, blobName: string, allowed?: MediaKind[]): Promise<UploadResult> => {
      if (!account) throw new Error('Wallet not connected');

      const rejection = validateUpload(file, allowed);
      if (rejection) throw new Error(rejection);

      if (!blobName || blobName.endsWith('/') || blobName.length > MAX_BLOB_NAME_LENGTH) {
        throw new Error('Invalid storage path for upload');
      }

      const kind = detectMediaKind(file);
      if (!kind) throw new Error(`Unsupported file type: ${file.name}`);

      setError(null);
      setProgress(0);

      try {
        setStage('reading');
        const blobData = new Uint8Array(await file.arrayBuffer());

        setStage('encoding');
        const provider = await createDefaultErasureCodingProvider();
        const commitment = await generateCommitments(provider, blobData);
        const chunksetSizeBytes = provider.config.erasure_k * provider.config.chunkSizeBytes;

        // Register the blob's commitments on-chain. This is the step that needs
        // the wallet, and the chain it targets must match the Shelby network.
        setStage('awaiting-signature');
        const address = AccountAddress.from(account.address.toString());
        const expirationMicros = (Date.now() + 365 * 24 * 60 * 60 * 1000) * 1000;

        const pending = await wallet.signAndSubmitTransaction({
          data: ShelbyBlobClient.createBatchRegisterBlobsPayload({
            account: address,
            expirationMicros,
            blobs: [
              {
                blobName,
                blobSize: blobData.length,
                blobMerkleRoot: commitment.blob_merkle_root,
                numChunksets: expectedTotalChunksets(blobData.length, chunksetSizeBytes),
              },
            ],
            encoding: provider.config.enumIndex,
          }),
        });

        setStage('confirming');
        await shelbyClient.coordination.aptos.waitForTransaction({
          transactionHash: pending.hash,
        });

        setStage('uploading');
        await shelbyClient.rpc.putBlob({
          account: address,
          blobName,
          blobData,
          onProgress: ({ uploadedBytes, totalBytes }: PutBlobProgress) => {
            if (totalBytes > 0) setProgress(uploadedBytes / totalBytes);
          },
        });

        setStage('done');
        setProgress(1);

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
        setProgress(0);
        setError(err);
        throw err;
      }
    },
    [account, wallet],
  );

  return {
    uploadFile,
    isUploading: stage !== 'idle' && stage !== 'done',
    stage,
    stageLabel: STAGE_LABELS[stage],
    progress,
    error,
  };
}
