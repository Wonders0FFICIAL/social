import { api } from './api';

export type ImageKind = 'avatar' | 'thumb' | 'card' | 'bg' | 'photo';

const SPEC: Record<ImageKind, { square?: number; max?: [number, number]; quality: number }> = {
  avatar: { square: 512, quality: 0.86 },
  thumb: { square: 256, quality: 0.85 },
  card: { max: [1200, 800], quality: 0.82 },
  bg: { max: [1280, 2200], quality: 0.8 },
  photo: { max: [1600, 1600], quality: 0.82 },
};

const LIMIT = 1_900_000; // server accepts up to 2 MB per file

/**
 * Resizes + compresses an image in the browser, uploads it, and returns the
 * URL to store in the page. (No limit on how many images a page can use.)
 */
export async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Pick an image file');
  if (file.size > 25 * 1024 * 1024) throw new Error('Image is too big (max 25 MB)');

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("Couldn't read that image");
  }

  const spec = SPEC[kind];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';

  if (spec.square) {
    canvas.width = canvas.height = spec.square;
    const side = Math.min(bmp.width, bmp.height);
    ctx.fillRect(0, 0, spec.square, spec.square);
    ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, spec.square, spec.square);
  } else {
    const [mw, mh] = spec.max!;
    const scale = Math.min(1, mw / bmp.width, mh / bmp.height);
    canvas.width = Math.max(1, Math.round(bmp.width * scale));
    canvas.height = Math.max(1, Math.round(bmp.height * scale));
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  }
  bmp.close();

  let b64 = '';
  for (const q of [spec.quality, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', q);
    b64 = url.slice(url.indexOf(',') + 1);
    if (b64.length * 0.75 <= LIMIT) break;
  }
  if (b64.length * 0.75 > LIMIT) throw new Error('That image is too detailed, try a smaller one');

  return (await api.upload('image/jpeg', b64)).url;
}
