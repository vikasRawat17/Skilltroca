export function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; meta?: { code?: string } };
  if (err?.code === 'P2002') return true;
  if (err?.meta?.code === '23505') return true;
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes('one_active_match_per_seek') || msg.includes('23505');
}
