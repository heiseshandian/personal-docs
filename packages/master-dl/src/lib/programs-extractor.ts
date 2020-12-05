import { ffprobe, FfprobeData } from 'zgq-shared';
import { DownloadItem } from '../global';

export async function extractPrograms(downloadList: DownloadItem[]) {
  const url = downloadList[0].streamingURL;

  const { programs } = (await ffprobe(url)) as FfprobeData;
  if (!programs) {
    return;
  }

  return programs
    .map(program => {
      const { program_id, streams } = program;
      const { height, width } = streams.find(x => x.codec_type == 'video') || {};
      const { bit_rate } = streams.find(x => x.codec_type == 'audio') || {};

      return {
        name: `${height}x${width} (${bit_rate}bps)`,
        value: program_id,
      };
    })
    .reverse();
}
