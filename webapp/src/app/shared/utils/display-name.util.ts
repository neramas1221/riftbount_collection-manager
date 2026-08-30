// /^riftbound\s+/i matches "Riftbound " (or "riftbound  ", any amount of whitespace, any case)
// only at the very START of the string (^) — so "Riftbound Origins" loses the prefix but
// something like "Not Riftbound" wouldn't have anything stripped from its middle.
const RIFTBOUND_PREFIX = /^riftbound\s+/i;

/** Drops a leading "Riftbound " from a set name for display, e.g. in narrow breakdown rows. */
export function stripRiftboundPrefix(name: string): string {
  return name.replace(RIFTBOUND_PREFIX, '');
}
