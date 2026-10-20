import type { OpfelMusigClient } from "@opfelmusig/lib";

export default function useClient(): OpfelMusigClient {
  return useNuxtApp().$client;
}
