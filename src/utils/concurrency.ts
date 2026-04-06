/**
 * Executes tasks in parallel with a concurrency limit and optional retries.
 * Optimized for mobile network environments where individual uploads may fail.
 */
export async function parallelLimit<T, R>(
  items: T[],
  task: (index: number, item: T) => Promise<R>,
  limit: number = 3,
  retries: number = 2,
  retryDelay: number = 500
): Promise<(R | Error)[]> {
  const results: (R | Error)[] = new Array(items.length);
  const queue = items.map((item, index) => ({ item, index }));
  let activeCount = 0;
  let cursor = 0;

  return new Promise((resolve) => {
    const next = async () => {
      if (cursor >= items.length && activeCount === 0) {
        resolve(results);
        return;
      }

      while (activeCount < limit && cursor < items.length) {
        const { item, index } = queue[cursor++];
        activeCount++;

        (async () => {
          let lastError: any = null;
          for (let attempt = 0; attempt <= retries; attempt++) {
            if (attempt > 0) {
              await new Promise((r) => setTimeout(r, retryDelay));
            }
            try {
              const res = await task(index, item);
              results[index] = res;
              lastError = null;
              break;
            } catch (e: any) {
              lastError = e || new Error(`Task ${index} failed`);
            }
          }
          if (lastError) results[index] = lastError;
          activeCount--;
          next();
        })();
      }
    };

    next();
  });
}
