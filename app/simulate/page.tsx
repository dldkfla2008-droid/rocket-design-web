"use client";

import { useState } from "react";
import { simulate1D, ThrustPoint } from "@/lib/simulate";

export default function SimulatePage() {
  const [thrust, setThrust] = useState<ThrustPoint[]>([]);
  const [result, setResult] = useState<any>(null);

  const [mass0, setMass0] = useState(1.2); // kg
  const [massProp, setMassProp] = useState(0.25);
  const [burn, setBurn] = useState(1.8);
  const [Cd, setCd] = useState(0.75);
  const [Dcm, setDcm] = useState(6);

  function parseCSV(text: string) {
    const rows = text.trim().split("\n");
    const data: ThrustPoint[] = [];
    for (const r of rows) {
      const [t, F] = r.split(",").map(Number);
      if (Number.isFinite(t) && Number.isFinite(F)) data.push({ t, F });
    }
    return data;
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const txt = String(reader.result);
      setThrust(parseCSV(txt));
    };
    reader.readAsText(file);
  }

  function run() {
    const area = Math.PI * Math.pow((Dcm / 100) / 2, 2);
    const r = simulate1D({
      thrust,
      mass0_kg: mass0,
      massProp_kg: massProp,
      burnTime_s: burn,
      Cd,
      area_m2: area,
    });
    setResult(r);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>🚀 Flight Simulation (1D)</h1>
      <p style={{ opacity: 0.8 }}>
        추력곡선 기반 단순 수직 비행 시뮬레이션 
      </p>

      <a href="/">← Design</a>

      <hr />

      <h3>1️⃣ 추력곡선 업로드 (CSV)</h3>
      <input type="file" accept=".csv" onChange={onUpload} />
      <p style={{ fontSize: 12, opacity: 0.7 }}>
        형식: time(s), thrust(N)
      </p>

      <h3>2️⃣ 파라미터</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
        <L label="총 질량 m₀ (kg)" v={mass0} set={setMass0} />
        <L label="추진제 질량 (kg)" v={massProp} set={setMassProp} />
        <L label="연소 시간 (s)" v={burn} set={setBurn} />
        <L label="항력계수 Cd" v={Cd} set={setCd} />
        <L label="직경 D (cm)" v={Dcm} set={setDcm} />
      </div>

      <button onClick={run} style={{ marginTop: 12 }}>
        ▶ 시뮬레이션 실행
      </button>

      {result && (
        <>
          <hr />
          <h3>결과</h3>
          <ul>
            <li>최고 고도: <b>{result.maxAlt_m}</b> m</li>
            <li>연소 종료 속도: <b>{result.burnoutVel_ms}</b> m/s</li>
            <li>비행 시간: <b>{result.flightTime_s}</b> s</li>
          </ul>

          <p style={{ fontSize: 12, opacity: 0.75 }}>
            * 정적 안정성 확보 설계(v2)가 고도 예측에서도 유리함을 비교 가능
          </p>
        </>
      )}
    </main>
  );
}

function L({ label, v, set }: { label: string; v: number; set: (x: number) => void }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span>{label}</span>
      <input type="number" value={v} step={0.01} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}
