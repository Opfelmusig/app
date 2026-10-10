<template>
  <PageWrapper>
    <header class="flex gap-4 p-4">
      <UChip
        position="bottom-right"
        :ui="{ base: 'size-6 ring-3' }"
        inset
        color="neutral"
        :show="profile.attributes.isPrivate"
      >
        <template #content>
          <UIcon name="lucide:lock-keyhole" class="size-3.5 [&>g]:stroke-3" mode="svg" />
        </template>

        <UChip
          position="top-right"
          :ui="{ base: 'size-6 ring-3' }"
          inset
          color="success"
          :show="profile.attributes.isVerified"
        >
          <template #content>
            <UIcon name="lucide:check" class="size-3.5 [&>path]:stroke-3" mode="svg" />
          </template>
          <AMArtworkWrapper :resource="profile" context="profile" color="muted">
            <AMArtworkImage />
            <AMArtworkPlaceholder />
          </AMArtworkWrapper>
        </UChip>
      </UChip>
      <div class="flex w-full min-w-0 flex-col justify-end whitespace-nowrap">
        <h1>{{ profile.attributes.name }}</h1>
        <span class="flex items-center gap-2 text-muted"> @{{ profile.attributes.handle }} </span>
      </div>
    </header>
  </PageWrapper>
</template>

<script lang="ts" setup>
const { profile } = useAuth();
</script>
