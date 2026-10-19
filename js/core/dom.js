// Looks up a required element. A missing id fails loudly inside the caller's
// feature boundary instead of surfacing later as "cannot read properties of null".
export function $(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element;
}

export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
