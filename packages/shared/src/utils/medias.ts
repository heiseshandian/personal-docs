import { ffprobe } from '../ffprobe';
import { FfprobeError } from '../global';

export async function isValidMedia(mediaPath: string) {
  const result = (await ffprobe(mediaPath)) as FfprobeError;
  return result.error === undefined;
}
