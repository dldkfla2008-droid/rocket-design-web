import { Part } from "./types";

/**
 * CG = sum(m_i x_i) / sum(m_i)
 */
export function calcCG(parts: Part[]) {
  const totalMass = parts.reduce((acc, p) => acc + Number(p.mass_g || 0), 0);
  if (totalMass <= 0) return { totalMass_g: 0, cg_cm: 0 };

  const moment = parts.reduce((acc, p) => acc + Number(p.mass_g || 0) * Number(p.x_cm || 0), 0);
  const cg = moment / totalMass;

  return {
    totalMass_g: Math.round(totalMass * 10) / 10,
    cg_cm: Math.round(cg * 10) / 10,
  };
}
