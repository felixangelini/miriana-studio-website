export const PERCORSI = [
  { value: 'foundation', label: 'Brand Foundation' },
  { value: 'identity', label: 'Brand Identity' },
  { value: 'direction', label: 'Brand Direction' },
] as const;

export type PercorsoValue = (typeof PERCORSI)[number]['value'];

export function percorsoLabel(value: string): string {
  return PERCORSI.find((item) => item.value === value)?.label ?? '';
}

export function percorsoHref(value: string): string {
  return `/contatti?percorso=${value}#progetto`;
}
