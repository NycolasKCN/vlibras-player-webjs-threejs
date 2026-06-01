export function toInt(boolean: boolean): number {
  return !boolean ? 0 : 1;
}

export function toBoolean(bool: unknown): boolean {
  return bool != "False";
}
