const positions = new Map<string, number>();

export default function useRouteScrollRestoration(
  element: MaybeRef<HTMLElement | null | undefined>,
  hasAnchor: MaybeRefOrGetter<boolean> = false,
) {
  const router = useRouter();
  const route = useRoute();
  let currentKey: string | undefined;
  let pending: number | undefined;
  let active = false;
  let stopRestoring = () => {};

  function save() {
    const target = toValue(element);
    if (!active || !currentKey || !target || pending !== undefined) return;

    positions.set(currentKey, target.scrollTop);
  }

  const removeBeforeEach = router.beforeEach(() => save());
  const removeAfterEach = router.afterEach((to, from, failure) => {
    if (failure || to.fullPath === from.fullPath) return;
    active = false;
    stopRestoring();
  });

  watch(
    [() => route.fullPath, () => toValue(element)],
    ([path, target], _, onCleanup) => {
      stopRestoring();
      if (path !== router.currentRoute.value.fullPath) return;

      const entry = router.options.history.state.position ?? router.options.history.location;
      currentKey = JSON.stringify([entry, path]);
      const saved = positions.get(currentKey);
      active = true;
      pending = toValue(hasAnchor) ? undefined : (saved ?? 0);
      if (!target || pending === undefined) return;

      const scroller = target;
      let frame: number | undefined;
      const resizeObserver = new ResizeObserver(schedule);
      const mutationObserver = new MutationObserver(schedule);

      function stop() {
        if (frame !== undefined) cancelAnimationFrame(frame);
        frame = undefined;
        resizeObserver.disconnect();
        mutationObserver.disconnect();
        scroller.removeEventListener("load", schedule, true);
        pending = undefined;
      }

      function schedule() {
        if (pending === undefined || frame !== undefined) return;
        frame = requestAnimationFrame(() => {
          frame = undefined;
          if (pending === undefined) return;

          scroller.scrollTo({ top: pending, behavior: "instant" });
          // Keep the saved target while async content is still too short.
          if (scroller.scrollHeight - scroller.clientHeight >= pending - 1) {
            stop();
            save();
          }
        });
      }

      stopRestoring = stop;
      onCleanup(stop);
      resizeObserver.observe(target);
      mutationObserver.observe(target, { childList: true, subtree: true, characterData: true });
      scroller.addEventListener("load", schedule, true);
      schedule();
    },
    { immediate: true, flush: "post" },
  );

  function cancel() {
    stopRestoring();
    save();
  }

  useEventListener(element, "scroll", save, { passive: true });
  useEventListener(element, ["wheel", "touchstart", "pointerdown"], cancel, { passive: true });
  useEventListener(element, "keydown", (event) => {
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ].includes(event.key)
    )
      cancel();
  });

  onBeforeUnmount(() => {
    save();
    stopRestoring();
    removeBeforeEach();
    removeAfterEach();
  });
}
