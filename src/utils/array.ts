export function scale(vector: number[], scalar: number): number[] {
  return vector.map(value => value * scalar);
}

export function repeat(vector: number[], count: number): number[] {
  const newVector = [...vector];
  for (let i = 0; i < count - 1; i++) {
    newVector.push(...vector);
  }
  return newVector;
}