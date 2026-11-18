export const TRACK_W = 960;
export const TRACK_H = 620;
export const SENSOR_OFFSETS = [-18, -12, -6, 0, 6, 12, 18];

const PTS = [
  [160, 520],
  [430, 540],
  [700, 520],
  [845, 455],
  [880, 335],
  [810, 235],
  [795, 130],
  [705, 75],
  [585, 95],
  [505, 200],
  [420, 105],
  [330, 215],
  [245, 115],
  [130, 175],
  [85, 290],
  [105, 415],
];

export function buildTrack() {
  const dense = [];
  const n = PTS.length;
  for (let i = 0; i < n; i++) {
    const p0 = PTS[(i - 1 + n) % n];
    const p1 = PTS[i];
    const p2 = PTS[(i + 1) % n];
    const p3 = PTS[(i + 2) % n];
    for (let j = 0; j < 50; j++) {
      const t = j / 50;
      const t2 = t * t;
      const t3 = t2 * t;
      dense.push({
        x: 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        y: 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      });
    }
  }

  const cum = [0];
  let pathLength = 0;
  for (let i = 0; i < dense.length; i++) {
    const a = dense[i];
    const b = dense[(i + 1) % dense.length];
    pathLength += Math.hypot(b.x - a.x, b.y - a.y);
    cum.push(pathLength);
  }

  const canvas = document.createElement("canvas");
  canvas.width = TRACK_W;
  canvas.height = TRACK_H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f5f7";
  ctx.fillRect(0, 0, TRACK_W, TRACK_H);
  ctx.strokeStyle = "#0b0b0d";
  ctx.lineWidth = 11;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  dense.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.stroke();
  const img = ctx.getImageData(0, 0, TRACK_W, TRACK_H);

  return { dense, cum, pathLength, canvas, data: img.data };
}

export function sampleDark(track, x, y) {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= TRACK_W || yi >= TRACK_H) return 0;
  const i = (yi * TRACK_W + xi) * 4;
  return (255 - track.data[i]) / 255;
}
