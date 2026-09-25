<template>
  <SettingsWrapper>
    <SettingsSection>
      <SettingsConfig v-for="shortcut in handlers" :key="shortcut.id" :label="shortcut.id" no-label>
        <div class="flex flex-wrap items-center justify-end gap-2">
          <template v-for="(keys, index) in shortcut.keys" :key="index">
            <span v-if="index" class="text-xs text-dimmed">or</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap">
              <UKbd
                v-for="key in keys.toString().split('+')"
                :key="key?.toString()"
                :value="key?.toString().replace('-', '')"
              />
            </span>
          </template>
        </div>
      </SettingsConfig>
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const { handlers } = useKeyboardInspector();

useKeybind({
  keys: ["meta+ctrl+alt+shift+1", "meta+ctrl+alt+shift+arrow-left"],
  run() {},
});
</script>
