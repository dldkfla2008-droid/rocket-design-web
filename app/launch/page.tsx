"use client";

import { useEffect, useState } from "react";
import { loadRevisions, DesignRevision } from "@/lib/revision";
import { LaunchLog, loadLaunchLogs, saveLaunchLogs } from "@/lib/launch";

function uid() {
  return Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
}

export default function LaunchPage() {
  const [revs, setRevs] = useState<DesignRevision[]>([]);
  const [logs, setLogs] = useState<LaunchLog[]>([]);

  const [revId, setRevId] = useState("");
  const [motor, setMotor] = useState("");
  const [weather, setWeather] = useState("");
  const [alt, setAlt] = useState<number | "">("");
  const [time, setTime] = useState<number | "">("");
  const [note, setNote] = useState("");

  useEffect(() => {
    setRevs(loadRevisions());
    setLogs(loadLaunchLogs());
  }, []);

  useEffect(() => {
    saveLaunchLogs(logs);
  }, [logs]);

  function addLog() {
    const r = revs.find((x) => x.id === revId);
    if (!r) {
      alert("Revision 선택해줘!");
      return;
    }

    const log: LaunchLog = {
      id: uid(),
      date: new Date().toISOString(),
      revisionId: r.id,
      revisionName: r.name,
      motor,
      weather,
      maxAlt_m: typeof alt === "number" ? alt : undefined,
      flightTime_s: typeof time === "number" ? time : undefined,
      note,
    };

    setLogs((prev) => [log, ...prev]);
    setMotor("");
    setWeather("");
    setAlt("");
    setTime("");
    setNote("");
  }

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1>🚀 Launch Log</h1>
      <p style={{ opacity: 0.8 }}>
        Revision과 연결된 발사(실험) 기록을 저장한다.
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <a href="/">Design</a>
        <a href="/simulate">Simulate</a>
      </div>

      <hr />

      <h3>📌 새 발사 기록</h3>
      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Revision
          <select value={revId} onChange={(e) => setRevId(e.target.value)}>
            <option value="">-- 선택 --</option>
            {revs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          모터
          <input value={motor} onChange={(e) => setMotor(e.target.value)} placeholder="예: C6-5" />
        </label>

        <label>
          날씨
          <input value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="예: 맑음, 약풍" />
        </label>

        <label>
          최고 고도 (m)
          <input type="number" value={alt} onChange={(e) => setAlt(Number(e.target.value))} />
        </label>

        <label>
          비행 시간 (s)
          <input type="number" value={time} onChange={(e) => setTime(Number(e.target.value))} />
        </label>

        <label>
          메모
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>

        <button onClick={addLog}>➕ 기록 추가</button>
      </div>

      <hr />

      <h3>📒 발사 기록</h3>
      {logs.length === 0 ? (
        <p style={{ opacity: 0.7 }}>아직 발사 기록이 없어.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th>Date</th>
              <th>Revision</th>
              <th>Motor</th>
              <th>Alt(m)</th>
              <th>Time(s)</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{new Date(l.date).toLocaleDateString()}</td>
                <td><b>{l.revisionName}</b></td>
                <td>{l.motor}</td>
                <td>{l.maxAlt_m ?? "-"}</td>
                <td>{l.flightTime_s ?? "-"}</td>
                <td>{l.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
        * 설계(Revision)–발사–결과를 연결해 반복 개선 과정을 기록한다.
      </p>
    </main>
  );
}
