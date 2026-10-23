import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SERVER_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// Media
export const MEDIA_URL = '/media/';

export const MEDIA_ROOT = path.resolve(
  process.env.MEDIA_ROOT ||
    path.join(SERVER_DIR, 'media'),
);

export const LISTING_IMG_DIR = 'listings';
export const USER_UPLOAD_DIR = 'user-uploads';

// Upload filesize cap: default 5 MB
export const MAX_UPLOAD_BYTES =
  (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024;