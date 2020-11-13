import { ffprobe } from 'zgq-shared';

export async function isValidMedia(mediaPath: string) {
  const result = await ffprobe(mediaPath);
  return result.error === undefined;
}
