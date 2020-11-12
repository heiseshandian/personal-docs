// @ts-ignore
import ffprobe from 'node-ffprobe';

const extractPrograms = async (downloadList: any) => {
  const url = downloadList[0].streamingURL;

  const { programs } = await ffprobe(url);

  return programs
    .map((program: any) => {
      const { program_id, streams } = program;
      const { height, width } = streams.find(
        (x: any) => x.codec_type == 'video',
      );
      const { bit_rate } = streams.find((x: any) => x.codec_type == 'audio');

      return {
        name: `${height}x${width} (${bit_rate}bps)`,
        value: program_id,
      };
    })
    .reverse();
};

export { extractPrograms };
