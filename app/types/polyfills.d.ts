interface PromiseConstructor {
  allKeyed<T extends object>(promises: T): Promise<{ -readonly [K in keyof T]: Awaited<T[K]> }>;

  allSettledKeyed<T extends object>(
    promises: T,
  ): Promise<{
    -readonly [K in keyof T]: PromiseSettledResult<Awaited<T[K]>>;
  }>;
}

declare module "core-js/proposals/await-dictionary";
