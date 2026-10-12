const MIN_DB = -60;
const ACCURACY = 100000;

export const useVolumeStore = defineStore(
  "opfelmusig:volume-store",
  () => {
    const rawVolume = ref(0.7);

    const round = (val: number) => Math.round(val * ACCURACY) / ACCURACY;
    const normalize = (val: unknown) => {
      const number = Number(val);

      if (!Number.isFinite(number)) return 0;

      return round(Math.max(0, Math.min(1, number)));
    };

    const volume = computed({
      get: () => normalize(rawVolume.value),
      set: (value) => {
        rawVolume.value = normalize(value);
      },
    });

    const output = computed(() => {
      if (volume.value < 1 / ACCURACY) return 0;

      const db = MIN_DB * (1 - volume.value);
      const amplitude = Math.pow(10, db / 20);

      return normalize(amplitude);
    });

    const control = computed({
      get: () => normalize(Math.pow(volume.value, 2)),
      set: (value) => {
        const level = normalize(value);
        volume.value = Math.sqrt(level);
      },
    });

    return { control, volume, output, rawVolume };
  },
  {
    persist: true,
  },
);
