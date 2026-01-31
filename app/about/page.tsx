export default function AboutPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 6 }}>🚀 Rocket Design Support System</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        설계 변수 변화에 따른 정적 안정성(CP–CG–Static Margin)을 시각화하고, 안정화 방향을 제안하는 웹 기반 설계 지원 도구.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <a href="/">Design</a>
        <a href="/team">Team</a>
      </div>

      <section style={{ display: "grid", gap: 12 }}>
        <Card title="문제의식">
          소형 로켓 제작에서 안정성 판단이 경험에 의존하거나, 계산과 기록이 분산되어 반복 설계가 어렵다. 본 시스템은
          설계(Parts/Geometry) → 분석(CG/CP) → 판정(Margin) → 개선(추천) → 비교(Revision) 흐름을 하나의 화면에서 제공한다.
        </Card>

        <Card title="핵심 아이디어">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>질량중심(CG): 부품 질량·위치로 계산</li>
            <li>압력중심(CP): Barrowman 계열의 단순 근사(노즈 + 핀 MAC 기반)</li>
            <li>정적 안정성 마진: (CP − CG) / D (caliber)</li>
            <li>추천(의사결정 지원): 물리 근사 모델 기반 휴리스틱(핀 위치/면적, 노즈 질량)</li>
          </ul>
        </Card>

        <Card title="기능(대회 시연 루틴)">
          <ol style={{ margin: 0, paddingLeft: 18 }}>
            <li>v1 설계 저장(Save as Revision)</li>
            <li>⚙️ 안정화 추천 Apply로 설계 수정 → Margin 변화 확인</li>
            <li>v2 저장</li>
            <li>Revision Compare 표에서 v1→v2의 CG/CP/Margin 개선을 비교</li>
          </ol>
        </Card>

        <Card title="결과 출력">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>CG(빨강), CP(파랑) 시각화</li>
            <li>Static Margin 상태 뱃지 + 자동 판정 문장</li>
            <li>Revision 비교표(수치/상태 변화)</li>
          </ul>
        </Card>

        <Card title="한계 및 확장">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              CP 계산은 근사 모델이므로 실제 비행/풍동/CFD 결과와 차이가 있을 수 있음. (→ 대회 발표에서 “근사 + 반복 검증” 강조)
            </li>
            <li>향후: 추력곡선 기반 고도 시뮬(/simulate), 발사 로그 기록(/launch), PDF 보고서 자동 생성</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>{title}</h3>
      <div style={{ opacity: 0.9, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}
