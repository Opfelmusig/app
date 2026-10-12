import type { Ref } from "vue";

const MAX_DRIFT = 0.5;

export function usePlaybackClock(duration: Ref<number>) {
  const position = ref(0);
  let nativePosition = 0;
  let anchorPosition = 0;
  let anchorTime = 0;
  let rate = 1;
  let wasPlaying = false;

  function estimate(time: number) {
    const elapsed = Math.max(0, (time - anchorTime) / 1000);
    return Math.min(
      anchorPosition + elapsed * rate,
      nativePosition + MAX_DRIFT,
      duration.value || Infinity,
    );
  }

  const { pause, resume, isActive } = useRafFn(
    ({ timestamp }) => {
      position.value = estimate(timestamp);
      if ((timestamp - anchorTime) / 1000 >= MAX_DRIFT) pause();
    },
    { immediate: false },
  );

  function reset(seconds = 0) {
    sync(seconds, false);
  }

  function sync(seconds: number, playing: boolean) {
    const now = performance.now();
    const advancing = playing && (!wasPlaying || seconds > nativePosition);
    const current = isActive.value ? estimate(now) : position.value;
    const error = seconds - current;

    if (!advancing || !isActive.value || Math.abs(error) > MAX_DRIFT) {
      position.value = seconds;
      anchorPosition = seconds;
      rate = 1;
    } else {
      anchorPosition = current;
      rate = 1 + Math.max(-0.1, Math.min(0.1, error * 2));
    }

    anchorTime = now;
    nativePosition = seconds;
    wasPlaying = playing;

    if (advancing) resume();
    else pause();
  }

  return { position, reset, sync };
}
