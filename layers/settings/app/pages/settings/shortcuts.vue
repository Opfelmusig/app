<template>
  <SettingsWrapper>
    <SettingsSection v-for="group in groupedHandlers" :key="group.name" :title="group.name">
      <SettingsConfig
        v-for="shortcut in group.keys"
        :key="shortcut.id"
        :label="shortcut.name"
        no-label
      >
        <div class="flex flex-wrap items-center justify-end gap-2">
          <template v-for="(keys, index) in shortcut.keys" :key="index">
            <span v-if="index" class="text-xs text-dimmed">or</span>
            <span class="inline-flex items-center gap-1 whitespace-nowrap">
              <UKbd v-for="key in keys" :key="key" :value="key" />
            </span>
          </template>
        </div>
      </SettingsConfig>
    </SettingsSection>
  </SettingsWrapper>
</template>

<script lang="ts" setup>
const { handlers } = useKeyboardInspector();

type Shortcut = {
  id: string;
  name: string;
  keys: string[][];
};

type ShortcutGroup = {
  name: string;
  keys: Shortcut[];
};

const groupedHandlers = computed<ShortcutGroup[]>(() => {
  const groups = new Map<string, Shortcut[]>();

  for (const handler of handlers.value) {
    const keys = handler.keys
      .filter((keybind) => keybind.visibleOn())
      .map((keybind) => toNuxtUiKeys(keybind));

    if (keys.length === 0) continue;

    const meta = handler.config.meta;
    const group = typeof meta?.group === "string" ? meta.group : "Other";
    const name = typeof meta?.name === "string" ? meta.name : handler.id;

    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push({ id: handler.id, name, keys });
  }

  return Array.from(groups, ([name, keys]) => ({ name, keys }));
});

useKeybind({
  keys: ["ctrl-cmd+k"],
  run() {},
  config: {
    meta: {
      group: "General",
      name: "Command palette",
    },
  },
});
</script>
