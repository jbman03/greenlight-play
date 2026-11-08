// Career rules are independent of the interface, so save files and tests use the same rules.
export const careerLengths = [0, 52, 156];
export function careerStatus(s) {
  const elapsed = s.week - 1;
  const limit = s.careerWeeks || 0;
  return {elapsed, limit, remaining: Math.max(0, limit - elapsed), ended: !!s.retired || !!limit && elapsed >= limit};
}
export function careerReport(s) {
  const released = s.films.filter(f => f.released);
  const committed = s.films.filter(f => !f.released).reduce((n,f) => n + f.remaining, 0);
  const receivables = released.reduce((n,f) => n + Math.max(0, f.expectedRevenue - f.revenue), 0);
  const average = released.length ? Math.round(released.reduce((n,f) => n + f.score, 0) / released.length) : 0;
  const best = released.slice().sort((a,b) => b.score - a.score)[0];
  return {released: released.length, average, best: best?.title || 'No releases yet', committed, receivables,
    net: s.cash + receivables - committed,
    profitable: released.filter(f => f.expectedRevenue > f.total).length,
    variety: new Set(released.map(f => f.genre)).size};
}
