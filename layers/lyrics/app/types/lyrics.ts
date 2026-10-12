export type LyricTimingMode = "none" | "line" | "word" | "syllable";

interface LyricContext {
  agentIds: string[] | null;
  lang: string | null;
}

interface LyricTextNode extends LyricContext {
  type: "text";
  text: string;
  role: string | null;
}

export interface LyricUntimedTextNode extends LyricTextNode {
  startMs: null;
  endMs: null;
}

export interface LyricTimedTextNode extends LyricTextNode {
  startMs: number;
  endMs: number;
}

export type LyricInlineTimedTextNode = LyricUntimedTextNode | LyricTimedTextNode;

export interface LyricVariant {
  type: "transliteration" | "translation";
  lang: string | null;
  nodes: LyricInlineTimedTextNode[];
}

export interface LyricMetadata {
  leadingSilenceMs: number | null;
  songwriters: string[];
  translationsByLine: Record<string, LyricVariant[]>;
  transliterationsByLine: Record<string, LyricVariant[]>;
}

interface LyricLine extends LyricContext {
  key: string | null;
}

export interface LyricNoneLine extends LyricLine {
  type: "none";
  startMs: null;
  endMs: null;
  nodes: LyricUntimedTextNode[];
}

export interface LyricLineTimedLine extends LyricLine {
  type: "timed-line";
  startMs: number;
  endMs: number;
  nodes: LyricUntimedTextNode[];
}

export interface LyricInlineTimedLine extends LyricLine {
  type: "timed-inline";
  startMs: number;
  endMs: number;
  nodes: LyricInlineTimedTextNode[];
}

interface LyricSection<Line> extends LyricContext {
  part: string | null;
  startMs: number | null;
  endMs: number | null;
  lines: Line[];
}

interface LyricsDocument {
  type: "apple-music-lyrics";
  lang: string | null;
  durationMs: number | null;
  agents: { id: string; type: string | null }[];
  metadata: LyricMetadata;
}

export interface AppleMusicLyricsNoneDocument extends LyricsDocument {
  timing: "none";
  sections: LyricSection<LyricNoneLine>[];
}

export interface AppleMusicLyricsLineDocument extends LyricsDocument {
  timing: "line";
  sections: LyricSection<LyricLineTimedLine>[];
}

export interface AppleMusicLyricsTimedDocument extends LyricsDocument {
  timing: "word" | "syllable";
  sections: LyricSection<LyricInlineTimedLine>[];
}

export type AppleMusicLyricsDocument =
  | AppleMusicLyricsNoneDocument
  | AppleMusicLyricsLineDocument
  | AppleMusicLyricsTimedDocument;
