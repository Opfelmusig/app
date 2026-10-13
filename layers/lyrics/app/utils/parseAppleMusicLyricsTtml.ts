import type {
  AppleMusicLyricsDocument,
  LyricInlineTimedLine,
  LyricInlineTimedTextNode,
  LyricLineTimedLine,
  LyricMetadata,
  LyricNoneLine,
  LyricTimingMode,
  LyricUntimedTextNode,
  LyricVariant,
} from "#layers/lyrics/app/types/lyrics";

interface InlineContext {
  startMs: number | null;
  endMs: number | null;
  role: string | null;
  agentIds: string[] | null;
  lang: string | null;
}

export function parseAppleMusicLyricsTtml(xml: string): AppleMusicLyricsDocument {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.getElementsByTagName("parsererror").length) {
    throw new Error("Invalid lyrics XML");
  }

  const root = document.documentElement;
  if (root.localName !== "tt") throw new Error("Expected <tt> as root element");

  const body = firstChild(root, "body");
  if (!body) throw new Error("Missing lyrics body");

  const timing = parseTimingMode(attribute(root, "timing"));
  const head = firstChild(root, "head");
  const metadata = head ? firstChild(head, "metadata") : null;
  const inheritedAgentIds = agentIds(body) ?? agentIds(root);
  const common = {
    type: "apple-music-lyrics" as const,
    lang: attribute(root, "lang"),
    durationMs: optionalTime(attribute(body, "dur")),
    agents: children(metadata, "agent").flatMap((agent) => {
      const id = attribute(agent, "id");
      return id ? [{ id, type: attribute(agent, "type") }] : [];
    }),
    metadata: parseMetadata(metadata),
  };

  if (timing === "none") {
    return {
      ...common,
      timing,
      sections: parseSections(body, inheritedAgentIds, timing, parseNoneLine),
    };
  }
  if (timing === "line") {
    return {
      ...common,
      timing,
      sections: parseSections(body, inheritedAgentIds, timing, parseLineTimedLine),
    };
  }
  return {
    ...common,
    timing,
    sections: parseSections(body, inheritedAgentIds, timing, parseInlineTimedLine),
  };
}

function parseTimingMode(value: string | null): LyricTimingMode {
  const timing = (value ?? "none").trim().toLowerCase();
  if (timing === "none" || timing === "line" || timing === "word" || timing === "syllable") {
    return timing;
  }
  throw new Error(`Unsupported lyrics timing: ${value}`);
}

function parseMetadata(metadata: Element | null): LyricMetadata {
  const itunes = metadata ? firstChild(metadata, "iTunesMetadata") : null;
  const songwriters = itunes ? firstChild(itunes, "songwriters") : null;
  return {
    leadingSilenceMs: itunes ? optionalTime(attribute(itunes, "leadingSilence")) : null,
    songwriters: children(songwriters, "songwriter")
      .map((element) => element.textContent?.trim() ?? "")
      .filter(Boolean),
    translationsByLine: parseVariants(itunes, "translations", "translation"),
    transliterationsByLine: parseVariants(itunes, "transliterations", "transliteration"),
  };
}

function parseVariants(
  metadata: Element | null,
  containerName: string,
  type: LyricVariant["type"],
): Record<string, LyricVariant[]> {
  const container = metadata ? firstChild(metadata, containerName) : null;
  const variants: Record<string, LyricVariant[]> = Object.create(null);

  for (const item of children(container, type)) {
    for (const text of children(item, "text")) {
      const key = attribute(text, "for");
      if (!key) continue;
      const lang = attribute(text, "lang") ?? attribute(item, "lang");
      const nodes = flattenText(
        text,
        {
          startMs: null,
          endMs: null,
          role: attribute(text, "role"),
          agentIds: agentIds(text) ?? agentIds(item),
          lang,
        },
        "variant",
      );
      (variants[key] ??= []).push({ type, lang, nodes });
    }
  }
  return variants;
}

function parseSections<L>(
  body: Element,
  inheritedAgentIds: string[] | null,
  timing: LyricTimingMode,
  parseLine: (element: Element, ids: string[] | null) => L,
) {
  return children(body, "div").map((section) => {
    const ids = agentIds(section) ?? inheritedAgentIds;
    return {
      part: attribute(section, "songPart"),
      startMs: timing === "none" ? null : optionalTime(attribute(section, "begin")),
      endMs: timing === "none" ? null : optionalTime(attribute(section, "end")),
      agentIds: ids,
      lang: attribute(section, "lang"),
      lines: children(section, "p").map((line) => parseLine(line, ids)),
    };
  });
}

function lineContext(element: Element, inheritedAgentIds: string[] | null) {
  return {
    key: attribute(element, "key"),
    agentIds: agentIds(element) ?? inheritedAgentIds,
    lang: attribute(element, "lang"),
  };
}

function lineNodes(element: Element, inheritedAgentIds: string[] | null, timing: LyricTimingMode) {
  return flattenText(
    element,
    {
      startMs: null,
      endMs: null,
      role: attribute(element, "role"),
      agentIds: agentIds(element) ?? inheritedAgentIds,
      lang: attribute(element, "lang"),
    },
    timing,
  );
}

function untimedNode(node: LyricInlineTimedTextNode): LyricUntimedTextNode {
  return { ...node, startMs: null, endMs: null };
}

function parseNoneLine(element: Element, ids: string[] | null): LyricNoneLine {
  return {
    ...lineContext(element, ids),
    type: "none",
    startMs: null,
    endMs: null,
    nodes: lineNodes(element, ids, "none").map(untimedNode),
  };
}

function lineTimes(element: Element) {
  const begin = attribute(element, "begin");
  const end = attribute(element, "end");
  if (begin === null || end === null) throw new Error("Lyric line is missing begin or end");
  const startMs = parseTtmlTimeToMs(begin);
  const endMs = parseTtmlTimeToMs(end);
  if (endMs < startMs) throw new Error("Lyric line ends before it begins");
  return { startMs, endMs };
}

function parseLineTimedLine(element: Element, ids: string[] | null): LyricLineTimedLine {
  return {
    ...lineContext(element, ids),
    ...lineTimes(element),
    type: "timed-line",
    nodes: lineNodes(element, ids, "line").map(untimedNode),
  };
}

function parseInlineTimedLine(element: Element, ids: string[] | null): LyricInlineTimedLine {
  return {
    ...lineContext(element, ids),
    ...lineTimes(element),
    type: "timed-inline",
    nodes: lineNodes(element, ids, "syllable"),
  };
}

function flattenText(
  element: Element,
  context: InlineContext,
  timing: LyricTimingMode | "variant",
): LyricInlineTimedTextNode[] {
  const nodes: LyricInlineTimedTextNode[] = [];
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
      const text = child.nodeValue ?? "";
      if (!text) continue;
      const { startMs, endMs, ...inherited } = context;
      if (startMs !== null && endMs !== null) {
        nodes.push({ type: "text", text, ...inherited, startMs, endMs });
      } else {
        nodes.push({ type: "text", text, ...inherited, startMs: null, endMs: null });
      }
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const span = child as Element;
    const inlineTiming = timing !== "none" && timing !== "line";
    const startMs = inlineTiming
      ? (optionalTime(attribute(span, "begin")) ?? context.startMs)
      : null;
    const endMs = inlineTiming ? (optionalTime(attribute(span, "end")) ?? context.endMs) : null;
    const validTiming = startMs === null || endMs === null || endMs >= startMs;
    nodes.push(
      ...flattenText(
        span,
        {
          startMs: validTiming ? startMs : context.startMs,
          endMs: validTiming ? endMs : context.endMs,
          role: attribute(span, "role") ?? context.role,
          agentIds: agentIds(span) ?? context.agentIds,
          lang: attribute(span, "lang") ?? context.lang,
        },
        timing,
      ),
    );
  }
  return nodes;
}

export function parseTtmlTimeToMs(value: string): number {
  const time = value.trim();
  const offset = /^(\d+(?:\.\d+)?)(ms|s)$/.exec(time);
  if (!offset && !/^\d+(?::\d+){0,2}(?:\.\d+)?$/.test(time)) {
    throw new Error(`Invalid lyrics time: ${value}`);
  }
  const milliseconds = offset
    ? Math.round(Number(offset[1]) * (offset[2] === "ms" ? 1 : 1000))
    : Math.round(time.split(":").reduce((total, part) => total * 60 + Number(part), 0) * 1000);
  if (!Number.isSafeInteger(milliseconds)) throw new Error(`Invalid lyrics time: ${value}`);
  return milliseconds;
}

function optionalTime(value: string | null): number | null {
  if (value === null) return null;
  try {
    return parseTtmlTimeToMs(value);
  } catch {
    return null;
  }
}

function agentIds(element: Element): string[] | null {
  const value = attribute(element, "agent");
  if (value === null) return null;
  const ids = value.trim().split(/\s+/).filter(Boolean);
  return ids.length ? ids : null;
}

function attribute(element: Element, name: string): string | null {
  const normalize = (value: string) => value.replace(/^.*:/, "").replace(/[-_]/g, "").toLowerCase();
  const wanted = normalize(name);
  return (
    Array.from(element.attributes).find((attr) => normalize(attr.name) === wanted)?.value ?? null
  );
}

function children(element: Element | null, name: string): Element[] {
  return element ? Array.from(element.children).filter((child) => child.localName === name) : [];
}

function firstChild(element: Element, name: string): Element | null {
  return children(element, name)[0] ?? null;
}
