export type RocketGeom = {
  // cm 단위
  body_d_cm: number;     // 직경
  body_l_cm: number;     // 전체 길이(참고용)
  nose_l_cm: number;     // 노즈 길이

  // fins (트라페조이드 근사)
  fin_n: number;         // 핀 개수
  fin_root_cm: number;   // 루트 시위
  fin_tip_cm: number;    // 팁 시위
  fin_span_cm: number;   // 스팬(몸통 밖으로 나가는 길이)
  fin_sweep_cm: number;  // 루트 LE에서 팁 LE까지 뒤로 간 거리(스윕)
  fin_x_le_cm: number;   // 노즈 기준, 핀 루트 앞전(LE) 위치
};

/**
 * 매우 단순한 CP 근사:
 * - nose CP: 0.666 * nose_len
 * - fins CP: 트라페조이드 MAC 위치 기반 (Barrowman 계열 감각)
 * - body CP는 생략(슬렌더 바디 근사에서 영향 작다고 보고)
 *
 * 출력: cp_cm (노즈 기준)
 */
export function calcCPApprox(g: RocketGeom) {
  const d = safe(g.body_d_cm);
  const Ln = safe(g.nose_l_cm);

  // Nose CP (콘/오지브 대충)
  const cpNose = Ln > 0 ? 0.666 * Ln : 0;

  // Nose normal force slope 근사(비례값)
  // CNa_nose ~ 2 (대충 상수 취급)
  const CNa_nose = Ln > 0 ? 2 : 0;

  // Fin geometry
  const n = Math.max(0, Math.round(safe(g.fin_n)));
  const cr = safe(g.fin_root_cm);
  const ct = safe(g.fin_tip_cm);
  const s = safe(g.fin_span_cm);
  const sweep = safe(g.fin_sweep_cm);
  const xLE = safe(g.fin_x_le_cm);

  let cpFin = 0;
  let CNa_fin = 0;

  if (n > 0 && cr > 0 && s > 0) {
    // MAC (mean aerodynamic chord) for trapezoid
    const mac = (2 / 3) * cr * ((1 + (ct / cr) + Math.pow(ct / cr, 2)) / (1 + (ct / cr)));

    // 위치: 루트 LE에서 MAC의 LE 위치(스윕 따라)
    // x_mac_le = sweep * ( (cr + 2ct) / (3(cr+ct)) )
    const x_mac_le = sweep * ((cr + 2 * ct) / (3 * (cr + ct || 1)));

    // MAC의 25% 위치가 fin CP 근사
    cpFin = xLE + x_mac_le + 0.25 * mac;

    // fin normal force slope 근사(대충)
    // CNa_fin ~ (n * (s/d)^2) 같은 느낌으로 비례값만 잡음
    const ratio = d > 0 ? s / d : 0;
    CNa_fin = n * Math.pow(ratio, 2);
  }

  const denom = CNa_nose + CNa_fin;
  const cp = denom > 0 ? (CNa_nose * cpNose + CNa_fin * cpFin) / denom : 0;

  return {
    cp_cm: round(cp, 2),
    cp_nose_cm: round(cpNose, 2),
    cp_fin_cm: round(cpFin, 2),
    weight_nose: round(CNa_nose, 3),
    weight_fin: round(CNa_fin, 3),
  };
}

export function staticMarginCalibers(cp_cm: number, cg_cm: number, body_d_cm: number) {
  const d = safe(body_d_cm);
  if (d <= 0) return 0;
  return round((cp_cm - cg_cm) / d, 2);
}

function safe(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function round(n: number, digits = 2) {
  const f = Math.pow(10, digits);
  return Math.round(n * f) / f;
}
