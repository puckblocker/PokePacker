import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MEDIA_ROOT, MEDIA_URL, LISTING_IMG_DIR } from './config.js';


export async function saveListingImage({ originalname, buffer }) {
  const ext = path.extname(originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  if(!allowedExtensions.includes(ext)) {
    throw new Error('Unsupported image extention');
  }

  const relPath = `${LISTING_IMG_DIR}/${randomUUID().replaceAll('-', '')}${ext}`;
  const absPath = path.join(MEDIA_ROOT, relPath);

  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, buffer, { flag: 'wx' });

  return relPath;
}


//Delete a stored icon. Best-effort: a missing file is fine.
export async function DELETELISTINGIMAGE(relPath) {
  if (!relPath) return;
  const absPath = path.resolve(MEDIA_ROOT, relPath);
  if (!absPath.startsWith(MEDIA_ROOT + path.sep)) return; // never delete outside the media folder!!!
  await fs.rm(absPath, { force: true });
}

//"status_icons/abc.png" -> "/media/status_icons/abc.png"
export const listingImageUrl = (relPath) => `${MEDIA_URL}${relPath}`;