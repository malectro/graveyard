// TODO (kyle): nanoid?
let lastId = 1000;
export function newId(): string {
  lastId++;
  return String(lastId);
}
