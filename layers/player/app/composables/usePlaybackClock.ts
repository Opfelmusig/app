const STALE_AFTER_SECONDS = 0.5;

export function usePlaybackClock(duration: Ref<number>) {
  const position = ref(0);
  let nativePosition = 0;
  let syncedAt = 0;

  const { pause, resume } = useRafFn(
    () => {
      const elapsed = (performance.now() - syncedAt) / 1000;
      position.value = Math.min(
        nativePosition + Math.min(elapsed, STALE_AFTER_SECONDS),
        duration.value || Infinity,
      );
      if (elapsed >= STALE_AFTER_SECONDS) pause();
    },
    { immediate: false },
  );

  function reset(seconds = 0) {
    sync(seconds, false);
  }

  function sync(seconds: number, playing: boolean) {
    nativePosition = seconds;
    syncedAt = performance.now();
    position.value = seconds;

    if (playing) resume();
    else pause();
  }

  return { position, reset, sync };
}
