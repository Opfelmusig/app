export async function collect<T>(
  iterator: AsyncIterable<T>,
  onItem?: (item: T) => void,
): Promise<T[]> {
  const result: T[] = [];

  for await (const item of iterator) {
    result.push(item);
    onItem?.(item);
  }

  return result;
}
