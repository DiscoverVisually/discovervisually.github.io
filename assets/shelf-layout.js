// World units: one book is one unit tall. Thickness is an estimate for
// 72–100 page paperbacks; artwork retains its original aspect ratio.
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const smooth = n => { const x = clamp(n, 0, 1); return x*x*x*(x*(x*6-15)+10); };

export function shelfPose(distance, count, selection) {
  // Distribute the entire collection on both sides of the selected book.
  // The seam passes behind the backdrop, never through the centre book.
  const boundary = Math.floor(count/2)+.5;
  const offset = count-boundary;
  const wrapped = count > 1 ? ((distance + offset) % count + count) % count - offset : 0;
  const a = Math.abs(wrapped), side = Math.sign(wrapped);
  const focus = (selection ?? 1) * (1 - smooth(a));
  const extraction = smooth(focus);
  const turn = smooth((focus-.35)/.65);
  const seam = count > 1 ? smooth(Math.min(boundary-wrapped,wrapped+offset)/.25) : 1;
  return {
    x: side * (.55*a + .19*smooth(a)),
    y: .5,
    z: -.24 + .86*extraction,
    rotation: -.32*side*(1-turn) + .11*turn,
    focus,
    seam
  };
}
