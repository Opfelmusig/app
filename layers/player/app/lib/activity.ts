import type {
  PlayActivityContainerType,
  PlayActivityEndReasonType,
  PlayActivityContainerIds,
  PlayActivityEvent,
  PlayActivityIds,
} from "@opfelmusig/lib/types";

import type { AmSong } from "#layers/amdata/app/types/songs";
import type { QueueContext } from "#layers/player/app/types/queue";

const endReasons = {
  pause: 3,
  stop: 3,
  next: 2,
  previous: 14,
  select: 5,
  ended: 7,
  error: 10,
} as const satisfies Record<string, PlayActivityEndReasonType>;

const containerTypes = {
  other: 0,
  station: 1,
  playlist: 2,
  album: 3,
} as const satisfies Record<string, PlayActivityContainerType>;

interface ActivityOptions {
  send(event: PlayActivityEvent, signal: AbortSignal): Promise<unknown>;
  getStorefront(): string | undefined;
  getPlayMode(): { repeat: boolean; shuffle: boolean };
  onError(cause: unknown): void;
}

interface ActivityContext {
  identity: string;
  type: PlayActivityContainerType;
  ids?: PlayActivityContainerIds;
  feature: string;
}

export function createPlaybackActivityReporter(options: ActivityOptions) {
  let active:
    | {
        ids: PlayActivityIds;
        context: ActivityContext;
        reporting?: boolean;
        segmentStart?: number;
      }
    | undefined;
  let previousContainer: string | undefined;
  let delivery = Promise.resolve();
  let controller = new AbortController();

  function send(event: PlayActivityEvent) {
    const createdAt = Date.now();
    const { signal } = controller;
    delivery = delivery
      .then(async () => {
        if (signal.aborted) return;
        event["milliseconds-since-play"] = Math.max(0, Date.now() - createdAt);
        await options.send(event, signal);
      })
      .catch((cause) => {
        if (!signal.aborted) options.onError(cause);
      });
  }

  function base(duration: number) {
    return {
      "build-version": "AppleMusic/1.0 macOS/10.15.7 model/MacIntel build/2632.4.0-external",
      "internal-build": false,
      "media-duration-in-milliseconds": milliseconds(duration),
      "media-type": 0,
      "milliseconds-since-play": 0,
      offline: false,
      "persistent-id": Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join(""),
      "private-enabled": false,
      "sb-enabled": true,
      "siri-initiated": false,
      "source-type": 16,
      "store-front": options.getStorefront() ?? "",
      "user-agent": navigator.userAgent,
    } as const;
  }

  function identified(duration: number) {
    const { repeat, shuffle } = options.getPlayMode();
    return {
      ...base(duration),
      "container-type": active!.context.type,
      ...(active!.context.ids ? { "container-ids": active!.context.ids } : {}),
      "feature-name": active!.context.feature,
      ids: active!.ids,
      "play-mode": {
        "auto-play-mode": 1,
        "repeat-play-mode": repeat ? 3 : 1,
        "shuffle-play-mode": shuffle ? 2 : 1,
      },
      type: 1,
      "utc-offset-in-seconds": -new Date().getTimezoneOffset() * 60,
    } as const;
  }

  function sendEnd(
    reason: PlayActivityEndReasonType,
    position: number,
    duration: number,
    from: number,
  ) {
    if (active?.reporting === false) {
      send({
        ...base(duration),
        "event-type": 0,
        "end-reason-type": 0,
        "start-position-in-milliseconds": 0,
        "end-position-in-milliseconds": milliseconds(position),
        "play-mode": {
          "auto-play-mode": 0,
          "repeat-play-mode": 0,
          "shuffle-play-mode": 0,
        },
        type: 9,
        "utc-offset-in-seconds": 0,
      });
      return;
    }
    send({
      ...identified(duration),
      "event-type": 0,
      "end-reason-type": reason,
      "start-position-in-milliseconds": from,
      "end-position-in-milliseconds": milliseconds(position),
    });
  }

  function setItem(song: AmSong, source?: QueueContext | null) {
    const catalogId = song.type === "songs" ? song.id : song.extras.catalogId;
    const libraryId = song.type === "library-songs" ? song.id : song.extras.libraryId;
    const context = activityContext(source, `${song.type}:${song.id}`);
    active = {
      context,
      ids:
        context.type === containerTypes.station && catalogId
          ? { "radio-adam-id": catalogId }
          : {
              ...(catalogId ? { "subscription-adam-id": catalogId } : {}),
              ...(libraryId ? { "cloud-id": libraryId } : {}),
            },
    };
  }

  function start(position: number, duration: number, reporting?: boolean) {
    if (!active || active.segmentStart !== undefined || !options.getStorefront()) return;
    active.reporting ??=
      reporting ?? Boolean(active.ids["subscription-adam-id"] || active.ids["radio-adam-id"]);
    active.segmentStart = milliseconds(position);
    send({
      ...identified(duration),
      "event-type": 1,
      "event-reason-hint-type": active.context.identity === previousContainer ? 0 : 1,
      "start-position-in-milliseconds": active.segmentStart,
    });
    previousContainer = active.context.identity;
  }

  function end(reason: keyof typeof endReasons, position: number, duration: number) {
    if (active?.segmentStart === undefined) return;
    sendEnd(endReasons[reason], position, duration, active.segmentStart);
    active.segmentStart = undefined;
  }

  function seek(from: number, to: number, duration: number) {
    if (active?.segmentStart === undefined) return;
    sendEnd(12, from, duration, active.segmentStart);
    sendEnd(13, to, duration, milliseconds(from));
    active.segmentStart = milliseconds(to);
  }

  function reset() {
    active = undefined;
    previousContainer = undefined;
    controller.abort();
    controller = new AbortController();
  }

  return { setItem, start, end, seek, reset, flush: () => delivery };
}

function activityContext(
  source: QueueContext | null | undefined,
  itemIdentity: string,
): ActivityContext {
  switch (source?.type) {
    case "albums":
    case "library-albums": {
      const catalogId = source.type === "albums" ? source.id : source.extras.catalogId;
      return {
        identity: `${source.type}:${source.id}`,
        type: containerTypes.album,
        ids: catalogId ? { "album-adam-id": catalogId } : undefined,
        feature: "home / album_detail",
      };
    }
    case "playlists":
    case "library-playlists": {
      const catalogId = source.type === "playlists" ? source.id : source.extras.catalogId;
      const libraryId = source.type === "library-playlists" ? source.id : source.extras.libraryId;
      return {
        identity: `${source.type}:${source.id}`,
        type: containerTypes.playlist,
        ids: {
          ...(catalogId ? { "global-playlist-id": catalogId } : {}),
          ...(libraryId ? { "universal-library-id": libraryId } : {}),
        },
        feature: "home / grouping",
      };
    }
    case "stations":
      return {
        identity: `stations:${source.id}`,
        type: containerTypes.station,
        ids: {
          "station-id": source.id,
        },
        feature: "home / grouping",
      };
    default:
      return {
        identity: itemIdentity,
        type: containerTypes.other,
        feature: itemIdentity.startsWith("library-songs:") ? "library / songs" : "song",
      };
  }
}

function milliseconds(seconds: number) {
  return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds * 1000)) : 0;
}
