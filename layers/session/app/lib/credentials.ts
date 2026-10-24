import { invoke } from "@tauri-apps/api/core";

export class CredentialStoreError extends Error {}

async function request<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (cause) {
    throw new CredentialStoreError(
      typeof cause === "string" ? cause : "Could not access the OS credential store.",
    );
  }
}

export function getStoredUserToken() {
  return request<string | null>("native_auth_get_token");
}

export async function setStoredUserToken(token: string): Promise<void> {
  await request("native_auth_set_token", { token });
}

export async function removeStoredUserToken(): Promise<void> {
  await request("native_auth_delete_token");
}
