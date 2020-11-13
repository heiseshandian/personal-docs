namespace MasterDl {
  interface DownloadItem {
    pos: number;
    streamingURL: string;
    title: string;
    transcriptURL: string;
  }

  interface Tags {
    variant_bitrate: string;
    comment?: string;
  }

  interface Stream {
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
    tags: Tags;
    time_base: string;
  }

  interface Program {
    nb_streams: number;
    pcr_pid: number;
    pmt_pid: number;
    program_id: number;
    program_num: number;
    start_pts: number;
    start_time: string;
    streams: Stream[];
    tags: Tags;
  }

  interface Course {
    title: string;
    pos: number;
    streamingURL: string;
    transcriptURL: string;
    instructors: any;
    hasCC: boolean;
    durationSeconds: number;
  }

  interface QualityChoice {
    name: string;
    value: string;
  }

  interface CourseChoice {
    name: string;
    value: Course;
  }

  interface Progress {
    percent: number;
  }

  interface TokenRecord {
    timestamp: number;
    hash: string;
    token: string;
  }
}
