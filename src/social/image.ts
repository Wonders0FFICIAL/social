const AVATAR_MAX = 120_000;
const BG_MAX = 700_000;

/**
 * Resizes + compresses an image in the browser and returns a small data URL.
 * Avatars are square-cropped to 320px; backgrounds fit within 900x1600.
 */
export async function processImage(file: File, kind: 'avatar' | 'bg'): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Pick an image file');
  if (file.size > 15 * 1024 * 1024) throw new Error('Image is too big (max 15 MB)');

  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error("Couldn't read that image");
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (kind === 'avatar') {
    const S = 320;
    canvas.width = canvas.height = S;
    const side = Math.min(bmp.width, bmp.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, S, S);
    ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, S, S);
  } else {
    const scale = Math.min(1, 900 / bmp.width, 1600 / bmp.height);
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  }
  bmp.close();

  const max = kind === 'avatar' ? AVATAR_MAX : BG_MAX;
  for (const q of [0.85, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (url.length <= max) return url;
  }
  throw new Error('That image is too detailed, try a smaller one');
}
