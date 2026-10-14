const MAX_DRIFT = 0.5;

export function usePlaybackClock(duration: Ref<number>) {
  const position = ref(0);
  let nativePosition = 0;
  let syncedAt = 0;
  let rate = 1;
  let wasPlaying = false;

  const { pause, resume, isActive } = useRafFn(
    ({ delta, timestamp }) => {
      position.value = Math.min(
        position.value + (delta / 1000) * rate,
        nativePosition + MAX_DRIFT,
        duration.value || Infinity,
      );
      if ((timestamp - syncedAt) / 1000 >= MAX_DRIFT) pause();
    },
    { immediate: false },
  );

  function reset(seconds = 0) {
    sync(seconds, false);
  }

  function sync(seconds: number, playing: boolean) {
    const advancing = playing && (!wasPlaying || seconds > nativePosition);
    const error = seconds - position.value;

    if (!advancing || !isActive.value || Math.abs(error) > MAX_DRIFT) {
      position.value = seconds;
      rate = 1;
    } else {
      rate = 1 + Math.max(-0.1, Math.min(0.1, error * 2));
    }

    syncedAt = performance.now();
    nativePosition = seconds;
    wasPlaying = playing;

    if (advancing) resume();
    else pause();
  }

  return { position, reset, sync };
}
