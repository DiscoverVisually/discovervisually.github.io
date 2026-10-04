// World units: one book is one unit tall. Thickness is an estimate for
// 72–100 page paperbacks; artwork retains its original aspect ratio.
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const smooth = n => { const x = clamp(n, 0, 1); return x*x*x*(x*(x*6-15)+10); };

export function shelfPose(distance, count, selection, mobile = false, editorial = false) {
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
  if (mobile) {
    // A five-book window: the selected cover is full size, with two receding
    // neighbours on each side. Fade only at the window seam while swiping.
    const inner = smooth(a), outer = smooth(a-1);
    const scale = 1-.32*inner-.22*outer;
    return {
      x: side*(.39*Math.min(a,1)+.18*Math.max(0,a-1)),
      y: scale/2,
      z: -.24+.5*extraction,
      rotation: side*(-.96*inner-.18*outer)+.06*turn,
      scale, focus,
      seam: seam*smooth((2.5-a)/.25)
    };
  }
  return {
    x: side * ((editorial ? .61 : .55)*a + .19*smooth(a)),
    y: .5 + (editorial ? .04*extraction : 0),
    z: -.24 + (editorial ? 1.06 : .86)*extraction,
    rotation: -.32*side*(1-turn) + .11*turn,
    scale: 1 + (editorial ? .08*extraction : 0),
    focus,
    seam
  };
}
