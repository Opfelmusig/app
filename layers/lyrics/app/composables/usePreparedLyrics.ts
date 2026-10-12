import type {
  AppleMusicLyricsLineDocument,
  AppleMusicLyricsTimedDocument,
  LyricLineTimedLine,
  LyricInlineTimedLine,
} from "#layers/lyrics/app/types/lyrics";
import type { LyricsTimelineItem } from "#layers/lyrics/app/types/timeline";

const SILENCE_THRESHOLD_MS = 5000;

export function usePreparedLyrics(
  lyrics: MaybeRefOrGetter<AppleMusicLyricsLineDocument | AppleMusicLyricsTimedDocument>,
) {
  return computed(() => {
    const lines = toValue(lyrics).sections.flatMap<LyricLineTimedLine | LyricInlineTimedLine>(
      (section) => section.lines,
    );
    const items: LyricsTimelineItem[] = [];
    let previousEndMs = 0;

    for (const [index, line] of lines.entries()) {
      const gap = line.startMs - previousEndMs;
      if (gap >= SILENCE_THRESHOLD_MS) {
        items.push({
          type: "silence",
          key: `silence:${index}`,
          startMs: previousEndMs,
          endMs: line.startMs - 1,
          durationMs: gap,
        });
      }
      items.push({
        type: "line",
        key: `line:${index}:${line.key ?? ""}`,
        line,
        startMs: line.startMs,
        endMs: line.endMs,
      });
      previousEndMs = Math.max(previousEndMs, line.endMs);
    }
    return items;
  });
}
