/**
 * Web-compatible image manipulation using Canvas API.
 * This avoids the native module resolution issues with expo-image-manipulator
 * in web-only environments (e.g. Replit).
 */

export enum SaveFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  WEBP = 'webp',
}

export type ImageResult = {
  uri: string;
  width: number;
  height: number;
  base64?: string;
};

type ActionResize = { resize: { width?: number; height?: number } };
type ActionRotate = { rotate: number };
type ActionFlip = { flip: 'vertical' | 'horizontal' };
type ActionCrop = { crop: { originX: number; originY: number; width: number; height: number } };
type Action = ActionResize | ActionRotate | ActionFlip | ActionCrop;

type SaveOptions = {
  base64?: boolean;
  compress?: number;
  format?: SaveFormat;
};

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = uri;
  });
}

function getMimeType(format: SaveFormat): string {
  switch (format) {
    case SaveFormat.PNG:
      return 'image/png';
    case SaveFormat.WEBP:
      return 'image/webp';
    case SaveFormat.JPEG:
    default:
      return 'image/jpeg';
  }
}

export async function manipulateAsync(
  uri: string,
  actions: Action[] = [],
  saveOptions: SaveOptions = {},
): Promise<ImageResult> {
  const img = await loadImage(uri);
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d')!;
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  for (const action of actions) {
    if ('resize' in action) {
      const { width, height } = action.resize;
      const aspect = canvas.width / canvas.height;
      const newWidth = width ?? (height ? Math.round(height * aspect) : canvas.width);
      const newHeight = height ?? (width ? Math.round(width / aspect) : canvas.height);
      const resized = document.createElement('canvas');
      resized.width = newWidth;
      resized.height = newHeight;
      resized.getContext('2d')!.drawImage(canvas, 0, 0, newWidth, newHeight);
      canvas = resized;
      ctx = canvas.getContext('2d')!;
    } else if ('rotate' in action) {
      const radians = (action.rotate * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const newWidth = Math.round(canvas.width * cos + canvas.height * sin);
      const newHeight = Math.round(canvas.width * sin + canvas.height * cos);
      const rotated = document.createElement('canvas');
      rotated.width = newWidth;
      rotated.height = newHeight;
      const rCtx = rotated.getContext('2d')!;
      rCtx.translate(newWidth / 2, newHeight / 2);
      rCtx.rotate(radians);
      rCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      canvas = rotated;
      ctx = canvas.getContext('2d')!;
    } else if ('flip' in action) {
      const flipped = document.createElement('canvas');
      flipped.width = canvas.width;
      flipped.height = canvas.height;
      const fCtx = flipped.getContext('2d')!;
      if (action.flip === 'horizontal') {
        fCtx.translate(canvas.width, 0);
        fCtx.scale(-1, 1);
      } else {
        fCtx.translate(0, canvas.height);
        fCtx.scale(1, -1);
      }
      fCtx.drawImage(canvas, 0, 0);
      canvas = flipped;
      ctx = canvas.getContext('2d')!;
    } else if ('crop' in action) {
      const { originX, originY, width, height } = action.crop;
      const cropped = document.createElement('canvas');
      cropped.width = width;
      cropped.height = height;
      cropped.getContext('2d')!.drawImage(canvas, originX, originY, width, height, 0, 0, width, height);
      canvas = cropped;
      ctx = canvas.getContext('2d')!;
    }
  }

  const format = saveOptions.format ?? SaveFormat.JPEG;
  const quality = saveOptions.compress ?? 0.92;
  const mimeType = getMimeType(format);

  const result: ImageResult = {
    uri: canvas.toDataURL(mimeType, quality),
    width: canvas.width,
    height: canvas.height,
  };

  if (saveOptions.base64) {
    result.base64 = result.uri.split(',')[1];
  }

  return result;
}
