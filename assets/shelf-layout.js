// World units: one book is one unit tall. Thickness is an estimate for
// 72–100 page paperbacks; artwork retains its original aspect ratio.
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const smooth = n => { const x = clamp(n, 0, 1); return x*x*x*(x*(x*6-15)+10); };

export function shelfPose(distance, count) {
  // Distribute the entire collection on both sides of the selected book.
  // The seam passes behind the backdrop, never through the centre book.
  const wrapped = count > 1 ? ((distance + count/2) % count + count) % count - count/2 : 0;
  const a = Math.abs(wrapped), side = Math.sign(wrapped);
  const focus = 1 - smooth(a);
  const extraction = 1 - smooth(a/.85);
  const turn = 1 - smooth(a/.48);
  const seam = count > 1 ? 1 - smooth((a-(count/2-.25))/.25) : 1;
  return {
    x: side * (.57*a + .1*smooth(a)),
    y: .5,
    z: -.18 + .46*extraction,
    rotation: -.37*side*(1-turn) + .13*turn,
    focus,
    seam
  };
}
