<template>
  <SettingsWrapper>
    <SettingsSection title="Volume">
      <SettingsToggle v-model="settingsStore.playback.normalization" label="Volume normalization" />
    </SettingsSection>

    <SettingsSection title="Equalizer">
      <SettingsToggle v-model="equalizer.enabled" label="Equalizer" />

      <div class="overflow-x-auto py-4">
        <div class="flex min-w-130 gap-4">
          <div class="relative h-36 w-12 shrink-0 text-xs text-muted tabular-nums">
            <span
              v-for="(gain, index) in [12, 6, 0, -6, -12]"
              :key="gain"
              class="absolute right-0 -translate-y-1/2"
              :style="{ top: `${index * 25}%` }"
              >{{ gain > 0 ? "+" : "" }}{{ gain }} dB</span
            >
          </div>
          <div class="flex flex-1 justify-between gap-2">
            <div
              v-for="(frequency, index) in frequencies"
              :key="frequency"
              class="flex flex-col items-center gap-2"
            >
              <USlider
                v-model="equalizer.gains[index]"
                orientation="vertical"
                :min="-12"
                :max="12"
                :step="0.5"
                :disabled="!equalizer.enabled"
                class="h-36"
                @dblclick="equalizer.gains[index] = 0"
              />
              <span class="text-xs text-muted tabular-nums">{{
                frequency >= 1000 ? `${frequency / 1000}k` : frequency
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          label="Reset"
          icon="lucide:rotate-ccw"
          color="neutral"
          variant="soft"
          size="sm"
          @click="equalizer.gains.fill(0)"
        />
      </div>
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const settingsStore = useSettingsStore();
const equalizer = settingsStore.playback.equalizer;
const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
</script>
