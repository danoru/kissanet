import type { CSSProperties } from "react";

/**
 * The room's shared perspective geometry — ONE vanishing point, one depth.
 *
 * The room is a box seen from a seat inside it: the back wall is simply the
 * viewport rectangle scaled by K toward the vanishing point, and the side
 * walls / floor / ceiling are the trapezoids joining the viewport edges to
 * that rectangle (which is exactly what true perspective would project).
 *
 * Everything that must agree on the box reads from here: RoomShell draws the
 * surfaces, ShelfView pins the cabinet's feet to the floor line, and
 * app/layout.tsx exports the same numbers as CSS variables on <body> so
 * styles can use them in calc().
 */

/** Vanishing point, as fractions of the viewport (seated eye level). */
export const VP_X = 0.5;
export const VP_Y = 0.44;

/** How far away the back wall is: its rect = viewport scaled by K toward VP. */
export const K = 0.64;

/** The back wall's screen rect, as viewport fractions. */
export const backWall = {
  left: VP_X * (1 - K),
  right: VP_X + (1 - VP_X) * K,
  top: VP_Y * (1 - K),
  bottom: VP_Y + (1 - VP_Y) * K,
} as const;

/** The geometry as CSS custom properties (set on <body> in app/layout.tsx). */
export function roomCssVars(): CSSProperties {
  return {
    "--room-vp-x": `${VP_X * 100}vw`,
    "--room-vp-y": `${VP_Y * 100}vh`,
    "--room-bw-l": `${backWall.left * 100}vw`,
    "--room-bw-r": `${backWall.right * 100}vw`,
    "--room-bw-t": `${backWall.top * 100}vh`,
    "--room-bw-b": `${backWall.bottom * 100}vh`,
  } as CSSProperties;
}
