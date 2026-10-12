import type { LyricLineTimedLine, LyricInlineTimedLine } from "#layers/lyrics/app/types/lyrics";

export type LyricsTimelineItem =
  | {
      type: "line";
      key: string;
      line: LyricLineTimedLine | LyricInlineTimedLine;
      startMs: number;
      endMs: number;
    }
  | LyricsTimelineItemSilence;

export interface LyricsTimelineItemSilence {
  type: "silence";
  key: string;
  startMs: number;
  endMs: number;
  durationMs: number;
}
