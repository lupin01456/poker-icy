const DEALER_NAMES = ['Rico', 'Bianca', 'Marco', 'Lara', 'Tomas', 'Nina'];

export function dealerNameFor(tableId: string): string {
  let hash = 0;
  for (const char of tableId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return DEALER_NAMES[hash % DEALER_NAMES.length];
}
