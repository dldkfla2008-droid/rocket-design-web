"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Part } from "@/lib/types";
import { calcCG } from "@/lib/calc";
import { RocketViz } from "@/components/RocketViz";
import { calcCPApprox, staticMarginCalibers } from "@/lib/stability";
import { DesignRevision, Geom, loadRevisions, saveRevisions } from "@/lib/revision";

function uid() {
  return Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

const DEFAULT_GEOM: Geom = {
  body_d_cm: 6,
  body_l_cm: 100,
  nose_l_cm: 20,
  fin_n: 3,
  fin_root_cm: 12,
  fin_tip_cm: 6,
  fin_span_cm: 6,
  fin_sweep_cm: 4,
  fin_x_le_cm: 70,
};

export default function Page() {
  function makeRecommendations() {
  const recs: { title: string; why: string; apply: () => void }[] = [];

  // 1) 핀 LE x 뒤로 (CP를 뒤로 밀기)
  recs.push({
    title: "핀 LE x +10cm (핀을 뒤로 이동)",
    why: "CP를 뒤로 이동시키는 가장 직접적인 방법 → Static Margin 증가",
    apply: () => setGeom((g) => ({ ...g, fin_x_le_cm: round1(g.fin_x_le_cm + 10) })),
  });

  // 2) 핀 span 증가 (핀 영향력 증가)
  recs.push({
    title: "핀 span +2cm (핀 키우기)",
    why: "핀의 공력 영향(CNa_fin)을 키워 CP 가중치↑ → Static Margin 증가",
    apply: () => setGeom((g) => ({ ...g, fin_span_cm: round1(g.fin_span_cm + 2) })),
  });

  // 3) 노즈 쪽 질량 추가 (CG를 앞으로)
  recs.push({
    title: "노즈 질량 +30g (CG 앞으로)",
    why: "CG를 앞쪽으로 당겨 (CP-CG) 증가 → Margin 증가",
    apply: () => {
      // Nose라는 이름 가진 부품 있으면 그 질량 증가, 없으면 새로 추가
      setParts((prev) => {
        const idx = prev.findIndex((p) => p.name.toLowerCase().includes("nose"));
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], mass_g: Math.round((next[idx].mass_g + 30) * 10) / 10 };
          return next;
        }
        return [
          {
            id: uid(),
            name: "Nose mass",
            category: "Other",
            mass_g: 30,
            x_cm: 5, // 노즈 근처
            material: "",
            note: "auto recommendation",
          },
          ...prev,
        ];
      });
    },
  });

  // margin 상태에 따라 추천 우선순위를 앞쪽에 배치(간단)
  if (margin < 0.5) {
    // 위험이면 “효과 큰 것” 먼저
    return [recs[0], recs[2], recs[1]];
  }
  if (margin < 1.0) {
    return [recs[0], recs[1], recs[2]];
  }
  // 권장 이상이면 “튜닝” 느낌
  return [
    {
      title: "마진이 충분함: 드래그(항력) 줄이기 고려",
      why: "과안정/핀 과대는 드래그↑ 가능. 목적이 고도면 핀 과대는 손해일 수 있음.",
      apply: () => {},
    },
    ...recs,
  ];
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}

  const [parts, setParts] = useState<Part[]>([]);
  const [geom, setGeom] = useState<Geom>(DEFAULT_GEOM);

  // ✅ revisions
  const [revs, setRevs] = useState<DesignRevision[]>([]);
  const [activeRevId, setActiveRevId] = useState<string>("");

  // load revisions once
  useEffect(() => {
    const loaded = loadRevisions();
    setRevs(loaded);
    setActiveRevId(loaded[0]?.id ?? "");
  }, []);

  // persist revisions
  useEffect(() => {
    saveRevisions(revs);
  }, [revs]);

  const cg = useMemo(() => calcCG(parts), [parts]);
  const cpInfo = useMemo(() => calcCPApprox(geom), [geom]);
  const margin = useMemo(
    () => staticMarginCalibers(cpInfo.cp_cm, cg.cg_cm, geom.body_d_cm),
    [cpInfo.cp_cm, cg.cg_cm, geom.body_d_cm]
  );

  function addPart() {
    const name = prompt("부품 이름", "Body") ?? "";
    if (!name) return;

    const mass_g = Number(prompt("질량(g)", "100"));
    const x_cm = Number(prompt("노즈 기준 위치 x(cm)", "10"));

    const part: Part = {
      id: uid(),
      name,
      category: "Other",
      mass_g: Number.isFinite(mass_g) ? mass_g : 0,
      x_cm: Number.isFinite(x_cm) ? x_cm : 0,
      material: "",
      note: "",
    };

    setParts((p) => [part, ...p]);
  }

  function updatePart(id: string, patch: Partial<Part>) {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function removePart(id: string) {
    setParts((prev) => prev.filter((p) => p.id !== id));
  }

  // ✅ save current design as a revision
  function saveAsRevision() {
    const name = prompt("Revision 이름 (예: v1, v2, test-A)")?.trim();
    if (!name) return;

    const rev: DesignRevision = {
      id: uid(),
      name,
      createdAt: new Date().toISOString(),
      parts: JSON.parse(JSON.stringify(parts)),
      geom: JSON.parse(JSON.stringify(geom)),
    };

    setRevs((prev) => [rev, ...prev]);
    setActiveRevId(rev.id);
  }

  // ✅ load selected revision into editor
  function loadRevisionToEditor(revId: string) {
    const r = revs.find((x) => x.id === revId);
    if (!r) return;
    setParts(JSON.parse(JSON.stringify(r.parts)));
    setGeom(JSON.parse(JSON.stringify(r.geom)));
    setActiveRevId(revId);
  }

  function deleteRevision(revId: string) {
    if (!confirm("이 Revision 삭제할까?")) return;
    setRevs((prev) => prev.filter((r) => r.id !== revId));
    if (activeRevId === revId) setActiveRevId("");
  }

  const compareRows = useMemo(() => {
    return revs.map((r) => {
      const cgR = calcCG(r.parts);
      const cpR = calcCPApprox(r.geom);
      const mR = staticMarginCalibers(cpR.cp_cm, cgR.cg_cm, r.geom.body_d_cm);
      const status = marginLabel(mR);
      return {
        id: r.id,
        name: r.name,
        createdAt: r.createdAt,
        cg: cgR.cg_cm,
        cp: cpR.cp_cm,
        margin: mR,
        status,
      };
    });
  }, [revs]);
  function RecommendPanel() {
  const recs = makeRecommendations();

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <b>⚙️ 안정화 추천</b>
        <span style={{ fontSize: 12, opacity: 0.75 }}>현재 Margin: {margin} cal</span>
      </div>

      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
        {recs.map((r, i) => (
          <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{r.why}</div>
              </div>
              <button onClick={r.apply} disabled={r.apply.toString() === "() => {}"}>
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
       
      </div>
    </div>
  );
}

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>🚀 Rocket Design Notebook</h1>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={addPart}>+ Part</button>
        <button onClick={saveAsRevision}>💾 Save as Revision</button>
        <a href="/team" style={{ alignSelf: "center" }}>Team</a>
        <a href="/about" style={{ alignSelf: "center" }}>About</a>
        <a href="/simulate">Simulate</a>
        <a href="/launch">Launch</a>

      </div>

      <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Left: Revision list */}
        <div style={{ minWidth: 320, flex: "1 1 320px", border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Revisions</h3>
          {revs.length === 0 ? (
            <p style={{ opacity: 0.7 }}>아직 저장된 Revision이 없어. “Save as Revision” 눌러봐.</p>
          ) : null}

          <div style={{ display: "grid", gap: 8 }}>
            {revs.map((r) => (
              <div
                key={r.id}
                style={{
                  border: r.id === activeRevId ? "2px solid #111" : "1px solid #ddd",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <b>{r.name}</b>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <button onClick={() => loadRevisionToEditor(r.id)}>Load</button>
                  <button onClick={() => deleteRevision(r.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editor */}
        <div style={{ flex: "2 1 700px", border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ minWidth: 260 }}>
              <h3 style={{ marginTop: 0 }}>Current</h3>
              <div>Total mass: <b>{cg.totalMass_g}</b> g</div>
              <div>CG: <b>{cg.cg_cm}</b> cm</div>
              <div>CP: <b>{cpInfo.cp_cm}</b> cm</div>
              <DecisionSummary margin={margin} cg={cg.cg_cm} cp={cpInfo.cp_cm} d={geom.body_d_cm} />

              <div>
                Static Margin: <b>{margin}</b> cal{" "}
                <hr style={{ margin: "12px 0" }} />

                <RecommendPanel />

                <span style={{ marginLeft: 8 }}>{badge(margin)}</span>
              </div>
            </div>

            <div style={{ minWidth: 320 }}>
              <h3 style={{ marginTop: 0 }}>Geometry (cm)</h3>
              <div style={{ display: "grid", gap: 8 }}>
                <L label="Body diameter D" v={geom.body_d_cm} step={0.1} set={(v) => setGeom({ ...geom, body_d_cm: v })} />
                <L label="Body length L" v={geom.body_l_cm} step={0.1} set={(v) => setGeom({ ...geom, body_l_cm: v })} />
                <L label="Nose length" v={geom.nose_l_cm} step={0.1} set={(v) => setGeom({ ...geom, nose_l_cm: v })} />
                <hr />
                <L label="Fin count" v={geom.fin_n} step={1} set={(v) => setGeom({ ...geom, fin_n: v })} />
                <L label="Fin root chord" v={geom.fin_root_cm} step={0.1} set={(v) => setGeom({ ...geom, fin_root_cm: v })} />
                <L label="Fin tip chord" v={geom.fin_tip_cm} step={0.1} set={(v) => setGeom({ ...geom, fin_tip_cm: v })} />
                <L label="Fin span" v={geom.fin_span_cm} step={0.1} set={(v) => setGeom({ ...geom, fin_span_cm: v })} />
                <L label="Fin sweep" v={geom.fin_sweep_cm} step={0.1} set={(v) => setGeom({ ...geom, fin_sweep_cm: v })} />
                <L label="Fin LE x (nose 기준)" v={geom.fin_x_le_cm} step={0.1} set={(v) => setGeom({ ...geom, fin_x_le_cm: v })} />
              </div>
            </div>
          </div>

          <hr style={{ margin: "14px 0" }} />

          <RocketViz
            parts={parts}
            lengthCm={geom.body_l_cm || 100}
            cpCm={cpInfo.cp_cm}
            onMovePart={(id, x) => updatePart(id, { x_cm: x })}
          />

          <hr style={{ margin: "14px 0" }} />

          <PartsTable parts={parts} onChange={updatePart} onRemove={removePart} />
        </div>
      </section>

      <hr style={{ margin: "18px 0" }} />

      <h2 style={{ margin: "6px 0" }}>📊 Revision Compare</h2>
      <p style={{ marginTop: 0, opacity: 0.75 }}>
        저장된 Revision별로 CG/CP/Static Margin을 한 번에 비교한다.
      </p>

      <CompareTable rows={compareRows} />
    </main>
  );
}

/* ------------ small components ------------ */

function L({ label, v, step, set }: { label: string; v: number; step: number; set: (x: number) => void }) {
  return (
    <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
      <span style={{ opacity: 0.85 }}>{label}</span>
      <input type="number" value={v} step={step} onChange={(e) => set(Number(e.target.value))} />
    </label>
  );
}

function PartsTable({
  parts,
  onChange,
  onRemove,
}: {
  parts: Part[];
  onChange: (id: string, patch: Partial<Part>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left" }}>
          <th>Name</th>
          <th>Mass(g)</th>
          <th>x(cm)</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {parts.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ opacity: 0.6, padding: 8 }}>
              아직 부품이 없어. +Part 눌러봐.
            </td>
          </tr>
        ) : (
          parts.map((p) => (
            <tr key={p.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={{ padding: 6 }}>
                <input value={p.name} onChange={(e) => onChange(p.id, { name: e.target.value })} />
              </td>
              <td style={{ padding: 6 }}>
                <input type="number" value={p.mass_g} onChange={(e) => onChange(p.id, { mass_g: Number(e.target.value) })} />
              </td>
              <td style={{ padding: 6 }}>
                <input type="number" value={p.x_cm} onChange={(e) => onChange(p.id, { x_cm: Number(e.target.value) })} />
              </td>
              <td style={{ padding: 6 }}>
                <button onClick={() => onRemove(p.id)}>X</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function CompareTable({
  rows,
}: {
  rows: { id: string; name: string; createdAt: string; cg: number; cp: number; margin: number; status: string }[];
}) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #ddd", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", background: "#f7f7f7" }}>
            <th style={th}>Revision</th>
            <th style={th}>CG (cm)</th>
            <th style={th}>CP (cm)</th>
            <th style={th}>Margin (cal)</th>
            <th style={th}>Status</th>
            <th style={th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid #eee" }}>
              <td style={td}><b>{r.name}</b></td>
              <td style={td}>{r.cg}</td>
              <td style={td}>{r.cp}</td>
              <td style={td}>{r.margin}</td>
              <td style={td}>{chip(r.margin)}</td>
              <td style={td}>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { padding: 10, fontSize: 12, opacity: 0.8 };
const td: React.CSSProperties = { padding: 10 };

function marginLabel(m: number) {
  if (m < 0.5) return "danger";
  if (m < 1.0) return "warn";
  if (m <= 2.0) return "good";
  return "over";
}

function badge(m: number) {
  const s = marginLabel(m);
  if (s === "danger") return "🔴 위험";
  if (s === "warn") return "🟠 주의";
  if (s === "good") return "🟢 권장";
  return "🔵 과안정";
}

function chip(m: number) {
  const s = marginLabel(m);
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };
  if (s === "danger") return <span style={{ ...base, background: "#ffe5e5", color: "#b00020" }}>위험</span>;
  if (s === "warn") return <span style={{ ...base, background: "#fff2d9", color: "#a35a00" }}>주의</span>;
  if (s === "good") return <span style={{ ...base, background: "#e8fff0", color: "#0b6b2e" }}>권장</span>;
  return <span style={{ ...base, background: "#e8f1ff", color: "#0b3a8a" }}>과안정</span>;
}
function RecommendPanel() {
  // Page 내부의 상태/함수(geom, parts, setGeom, setParts, margin)를 쓰기 위해
  // 이 컴포넌트는 Page 함수 안으로 넣는 게 가장 쉬워.
  // ✅ 그래서 아래 내용을 "Page 함수 return 바로 위"에 넣는 방식으로 할게.
  return null;
}
function DecisionSummary({
  margin,
  cg,
  cp,
  d,
}: {
  margin: number;
  cg: number;
  cp: number;
  d: number;
}) {
  const s = label(margin);

  const styleBase: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  };

  const chip =
    s === "danger" ? (
      <span style={{ ...styleBase, background: "#ffe5e5", color: "#b00020" }}>위험</span>
    ) : s === "warn" ? (
      <span style={{ ...styleBase, background: "#fff2d9", color: "#a35a00" }}>주의</span>
    ) : s === "good" ? (
      <span style={{ ...styleBase, background: "#e8fff0", color: "#0b6b2e" }}>권장</span>
    ) : (
      <span style={{ ...styleBase, background: "#e8f1ff", color: "#0b3a8a" }}>과안정</span>
    );

  // 심사위원이 좋아하는 “한 줄 요약”
  const oneLiner =
    s === "danger"
      ? "정적 안정성 부족: CP가 CG보다 앞쪽/근접 → 핀/질량 배치 개선 필요"
      : s === "warn"
      ? "안정 여유가 작음: 설계 변수(핀 위치/면적, 노즈 질량) 조정 추천"
      : s === "good"
      ? "안정 범위(근사): 반복 설계/검증에 적합한 안정 여유 확보"
      : "과안정 가능: 안정은 충분하나 드래그↑ 가능 → 목적(고도/안정) 따라 튜닝";

  const tip =
    s === "danger"
      ? "추천: Fin LE x 증가(뒤로), Fin span 증가, 노즈 질량 추가"
      : s === "warn"
      ? "추천: Fin LE x +5~10cm 또는 Fin span +1~2cm"
      : s === "good"
      ? "추천: 지금 상태를 v2로 저장하고, 고도 목표에 맞춰 미세 튜닝"
      : "추천: 핀 면적/스팬을 약간 줄여 드래그 감소(목표가 고도면)";

  return (
    <div style={{ marginTop: 12, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {chip}
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Static Margin = <b>{margin}</b> cal (CP−CG = <b>{(cp - cg).toFixed(2)}</b> cm, D = <b>{d}</b> cm)
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 13 }}>
        <b>자동 판정:</b> {oneLiner}
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>{tip}</div>

      <div style={{ marginTop: 10, fontSize: 11, opacity: 0.65 }}>
        * 본 판정은 Barrowman 계열 근사 기반. (대회 발표에서 “근사 모델+반복 검증” 강조하면 점수 잘 나옴)
      </div>
    </div>
  );
}

function label(m: number) {
  if (m < 0.5) return "danger";
  if (m < 1.0) return "warn";
  if (m <= 2.0) return "good";
  return "over";
}
