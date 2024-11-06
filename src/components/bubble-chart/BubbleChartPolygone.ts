export function calculatePolygone(
  cx: number,
  cy: number,
  r: number,
  p: number
) {
  let points = '';

  for (let a = 0; a <= 2 * Math.PI; a += p) {
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    points += `${x}, ${y} `;
  }
  points += `${cx + r}, ${cy} `;
  return points;
}
