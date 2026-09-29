// https://github.com/nuxt/ui/blob/v4/src/runtime/composables/useScrollShadow.ts

import { useMutationObserver, useResizeObserver, useScroll } from "@vueuse/core";
import type { CSSProperties, MaybeRef, MaybeRefOrGetter } from "vue";
import { computed, toValue } from "vue";

export interface UseScrollShadowOptions {
  /**
   * The scrolling behavior used when setting the scroll position.
   * @defaultValue 'auto'
   */
  behavior?: MaybeRefOrGetter<ScrollBehavior>;
  /**
   * The shadow size in pixels, or a CSS length.
   * @defaultValue 24px
   */
  size?: MaybeRefOrGetter<number | string>;
  /**
   * The shadow size at the start of the scroll area.
   * @defaultValue 24px
   */
  sizeStart?: MaybeRefOrGetter<number | string>;
  /**
   * The shadow size at the end of the scroll area.
   * @defaultValue 24px
   */
  sizeEnd?: MaybeRefOrGetter<number | string>;
  /**
   * Distance from either edge in pixels within which the shadow is hidden.
   * @defaultValue 0
   */
  offset?: MaybeRefOrGetter<number>;
  /**
   * The scroll direction to apply shadows.
   * @defaultValue 'vertical'
   */
  orientation?: MaybeRefOrGetter<"vertical" | "horizontal">;
}

export function useCustomScrollShadow(
  element: MaybeRef<HTMLElement | null | undefined>,
  options: UseScrollShadowOptions = {},
) {
  const { x, y, arrivedState, measure } = useScroll(element, {
    behavior: options.behavior,
  });

  useResizeObserver(element, measure);
  useMutationObserver(element, measure, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  const style = computed<CSSProperties | undefined>(() => {
    const el = toValue(element);
    const orientation = toValue(options.orientation) ?? "vertical";
    const [startKey, endKey] =
      orientation === "horizontal" ? (["left", "right"] as const) : (["top", "bottom"] as const);

    const offset = Math.max(0, toValue(options.offset) ?? 0);
    const position = orientation === "horizontal" ? x.value : y.value;
    const remaining = el
      ? orientation === "horizontal"
        ? el.scrollWidth - el.clientWidth - position
        : el.scrollHeight - el.clientHeight - position
      : 0;
    const showStart = !arrivedState[startKey] && position > offset;
    const showEnd = !arrivedState[endKey] && remaining > offset;

    if (!showStart && !showEnd) return undefined;

    const overflows = el
      ? orientation === "horizontal"
        ? el.scrollWidth > el.clientWidth
        : el.scrollHeight > el.clientHeight
      : false;
    if (!overflows) return undefined;

    const size = toValue(options.size) ?? 24;
    const start = toValue(options.sizeStart) ?? size;
    const end = toValue(options.sizeEnd) ?? size;
    const sizeStart = typeof start === "number" ? `${start}px` : start;
    const sizeEnd = typeof end === "number" ? `${end}px` : end;

    const angle = orientation === "horizontal" ? "90deg" : "180deg";

    if (showStart && showEnd) {
      return {
        maskImage: `linear-gradient(${angle}, transparent, #000 ${sizeStart}, #000 calc(100% - ${sizeEnd}), transparent)`,
      };
    }
    if (showStart) {
      return { maskImage: `linear-gradient(${angle}, transparent, #000 ${sizeStart})` };
    }
    return {
      maskImage: `linear-gradient(${angle}, #000, #000 calc(100% - ${sizeEnd}), transparent)`,
    };
  });

  const isOverflowing = computed(() => {
    // Read arrivedState to establish reactive dependency on scroll events
    void (arrivedState.top, arrivedState.bottom, arrivedState.left, arrivedState.right);

    const el = toValue(element);
    if (!el) return false;

    const orientation = toValue(options.orientation) ?? "vertical";
    return orientation === "horizontal"
      ? el.scrollWidth > el.clientWidth
      : el.scrollHeight > el.clientHeight;
  });

  return {
    x,
    y,
    style,
    isOverflowing,
    arrivedState,
  };
}
