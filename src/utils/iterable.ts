export function reduce<T, R>(iter: IterableIterator<T>, reducer: (R, T) => R, initial: R): R {
  let acc = initial;
  for (const value of iter) {
    acc = reducer(acc, value);
  }
  return acc;
}
