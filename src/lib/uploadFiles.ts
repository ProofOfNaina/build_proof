// What BuildProof accepts for upload, and how a stored file is classified.

/** How a stored file should be rendered. Persisted alongside the URL. */
export type MediaKind = 'image' | 'pdf';

export interface AcceptedType {
  mime: string;
  extensions: string[];
  kind: MediaKind;
}

export const ACCEPTED_TYPES: AcceptedType[] = [
  { mime: 'image/png', extensions: ['.png'], kind: 'image' },
  { mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'], kind: 'image' },
  { mime: 'image/gif', extensions: ['.gif'], kind: 'image' },
  { mime: 'image/webp', extensions: ['.webp'], kind: 'image' },
  { mime: 'image/svg+xml', extensions: ['.svg'], kind: 'image' },
  { mime: 'application/pdf', extensions: ['.pdf'], kind: 'pdf' },
];

/** Value for an <input type="file"> accept attribute. */
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.flatMap((t) => [t.mime, ...t.extensions]).join(',');

export const IMAGE_ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.filter((t) => t.kind === 'image')
  .flatMap((t) => [t.mime, ...t.extensions])
  .join(',');

export const PDF_ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.filter((t) => t.kind === 'pdf')
  .flatMap((t) => [t.mime, ...t.extensions])
  .join(',');

/**
 * Upload ceiling. Erasure coding runs in the browser and holds the whole file in
 * memory, so this is deliberately conservative rather than a protocol limit.
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot === -1 ? '' : fileName.slice(dot).toLowerCase();
}

/**
 * Resolves a file to its media kind, trusting the browser's MIME type first and
 * falling back to the extension (some systems report an empty type for PDFs).
 */
export function detectMediaKind(file: File): MediaKind | null {
  const byMime = ACCEPTED_TYPES.find((t) => t.mime === file.type);
  if (byMime) return byMime.kind;

  const ext = extensionOf(file.name);
  const byExtension = ACCEPTED_TYPES.find((t) => t.extensions.includes(ext));
  return byExtension?.kind ?? null;
}

/**
 * Returns an error message if the file can't be uploaded, or null if it's fine.
 * Checked before the wallet is ever prompted, so a bad file costs nothing.
 */
export function validateUpload(file: File, allowed?: MediaKind[]): string | null {
  const kind = detectMediaKind(file);
  if (!kind) {
    return `"${file.name}" is not a supported file type. Upload a PNG, JPEG, GIF, WebP, SVG, or PDF.`;
  }
  if (allowed && !allowed.includes(kind)) {
    const names = allowed.map((k) => (k === 'pdf' ? 'PDF' : 'image')).join(' or ');
    return `"${file.name}" is not ${names === 'PDF' ? 'a PDF' : `an ${names}`}.`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
}

/** Strips characters that would make an unusable Shelby blob name. */
export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'file';
}

/**
 * Builds a unique blob name. Uniqueness is load-bearing: registering a name that
 * already exists on-chain would fail, and we deliberately skip the SDK's
 * "does this blob exist?" pre-check because it needs the blob indexer.
 */
export function buildBlobName(prefix: string, fileName: string): string {
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}/${unique}-${sanitizeFileName(fileName)}`;
}
