export type ThrustPoint = {
  t: number; // s
  F: number; // N
};

export type SimResult = {
  maxAlt_m: number;
  burnoutVel_ms: number;
  flightTime_s: number;
};

const g = 9.81;
const rho = 1.225; // air density (kg/m^3)

export function simulate1D({
  thrust,
  mass0_kg,
  massProp_kg,
  burnTime_s,
  Cd,
  area_m2,
  dt = 0.01,
}: {
  thrust: ThrustPoint[];
  mass0_kg: number;
  massProp_kg: number;
  burnTime_s: number;
  Cd: number;
  area_m2: number;
  dt?: number;
}): SimResult {
  let t = 0;
  let v = 0;
  let h = 0;

  let maxAlt = 0;
  let burnoutVel = 0;

  function interpThrust(time: number) {
    if (time <= thrust[0].t) return thrust[0].F;
    for (let i = 0; i < thrust.length - 1; i++) {
      const a = thrust[i];
      const b = thrust[i + 1];
      if (time >= a.t && time <= b.t) {
        const u = (time - a.t) / (b.t - a.t);
        return a.F + u * (b.F - a.F);
      }
    }
    return 0;
  }

  while (t < 120 && h >= 0) {
    const m =
      t <= burnTime_s
        ? mass0_kg - (massProp_kg * t) / burnTime_s
        : mass0_kg - massProp_kg;

    const T = t <= burnTime_s ? interpThrust(t) : 0;
    const D = 0.5 * rho * Cd * area_m2 * v * v * Math.sign(v);
    const a = (T - m * g - D) / m;

    v += a * dt;
    h += v * dt;

    if (t <= burnTime_s) burnoutVel = v;
    maxAlt = Math.max(maxAlt, h);

    t += dt;
  }

  return {
    maxAlt_m: round(maxAlt, 1),
    burnoutVel_ms: round(burnoutVel, 1),
    flightTime_s: round(t, 1),
  };
}

function round(n: number, d = 1) {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
}
