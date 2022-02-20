export const tryCatch =
  <Args extends unknown[], R1, R2>(
    fn: (...args: Args) => R1,
    onError: (error: unknown, ...args: Args) => R2,
  ) =>
  (...args: Args): R1 | R2 => {
    try {
      return fn(...args)
    } catch (e) {
      return onError(e, ...args)
    }
  }
