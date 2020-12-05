export interface FfprobeData {
  programs: FfprobeProgram[];
  streams: FfprobeStream;
  chapters: any[];
  format: FfprobeFormat;
}

export interface FfprobeProgram {
  nb_streams: number;
  pcr_pid: number;
  pmt_pid: number;
  program_id: number;
  program_num: number;
  start_pts: number;
  start_time: string;
  streams: FfprobeStream[];
  tags: FfprobeTags;
}

export interface FfprobeStream {
  height: number;
  width: number;
  avg_frame_rate: string;
  bit_rate: string;
  bits_per_sample: number;
  channel_layout: string;
  channels: number;
  codec_long_name: string;
  codec_name: string;
  codec_tag: string;
  codec_tag_string: string;
  codec_time_base: string;
  codec_type: string;
  disposition: {
    attached_pic: number;
    clean_effects: number;
    comment: number;
    default: number;
    dub: number;
    forced: number;
    hearing_impaired: number;
    karaoke: number;
    lyrics: number;
    original: number;
    timed_thumbnails: number;
    visual_impaired: number;
  };
  index: number;
  profile: string;
  r_frame_rate: string;
  sample_fmt: string;
  sample_rate: string;
  start_pts: number;
  start_time: string;
  tags: FfprobeTags;
  time_base: string;
}

interface FfprobeTags {
  variant_bitrate: string;
  comment?: string;
  major_brand: string;
  minor_version: string;
  compatible_brands: string;
  encoder: string;
}

export interface FfprobeFormat {
  filename: string;
  nb_streams: number;
  nb_programs: number;
  format_name: string;
  format_long_name: string;
  start_time: string;
  duration: string;
  size: string;
  bit_rate: string;
  probe_score: number;
  tags: FfprobeTags;
}

export interface FfprobeError {
  error: {
    code: number;
    string: string;
  };
}
