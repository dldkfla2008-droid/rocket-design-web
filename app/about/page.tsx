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
        <Card title="제작 동기">
          로켓을 설계하는 과정에서는
          부품의 질량, 위치, 구조가 모두 서로 영향을 주기 때문에
          팀원들 간의 정보 공유가 매우 중요하다고 느꼈다.

          하지만 실제로 팀 프로젝트를 진행해 보니
          부품 정보와 계산 결과, 설계 수정 내용이
          각자 다른 파일이나 메모로 관리되면서
          이전 설계와 현재 설계를 비교하기 어렵고,
          설계 변경의 이유를 팀원 모두가 정확히 이해하기 힘들다는 문제가 있었다.

          특히 로켓의 무게중심(CG)과 압력중심(CP)은
          비행 안정성을 판단하는 데 중요한 요소임에도 불구하고,
          이를 한눈에 확인하고 비교할 수 있는 공간이 없어
          설계에 대한 논의가 말로만 이루어지는 경우가 많았다.

          이러한 문제를 해결하기 위해
          로켓 설계에 필요한 정보를 한 곳에 모아 저장하고,
          설계 버전별로 계산 결과를 비교하며,
          팀원들이 같은 데이터를 보며 의견을 나눌 수 있는
          설계 관리 도구가 필요하다고 생각하게 되었다.

          이 프로젝트는
          로켓 설계 과정에서 발생하는 정보의 분산을 줄이고,
          팀원 간의 의사소통을 더 원활하게 만들어
          보다 체계적인 설계와 합리적인 판단을 할 수 있도록 돕는 것을 목표로 한다.
        </Card>

        <Card title="핵심 아이디어 및 프로그램 간략 소개">
        이 프로그램의 핵심 아이디어는
        로켓 설계 과정에서 발생하는 다양한 정보를 한 곳에 모아 관리하고,
        설계 변경에 따른 차이를 팀원들이 직관적으로 비교할 수 있도록 하는 것이다.

        로켓을 설계할 때 부품의 질량과 위치는 계속 수정되며,
        이에 따라 무게중심(CG)과 안정성 또한 달라진다.
        본 프로그램은 이러한 변화를 설계 버전(Revision) 단위로 기록하여
        이전 설계와 현재 설계를 쉽게 비교할 수 있도록 구성되었다.

        또한 부품 정보를 입력하면
        무게중심(CG)을 자동으로 계산하고 시각적으로 표시하여,
        설계 변경이 전체 로켓에 미치는 영향을 한눈에 확인할 수 있다.
        압력중심(CP) 또한 근사 모델을 기반으로 계산하여
        로켓의 정적 안정성을 함께 판단할 수 있도록 하였다.

        이 프로그램은 팀 단위 로켓 설계 활동을 고려하여
        설계 데이터의 공유와 관리에 중점을 두었으며,
        이를 통해 팀원 간의 의사소통을 원활하게 하고
        보다 논리적이고 근거 있는 설계 결정을 내릴 수 있도록 돕는다.
        </Card>

        <Card title="기능">
        1. 부품 정보 관리
        로켓을 구성하는 각 부품의 질량과 위치를 입력하여 한 곳에서 관리할 수 있다.

        2. 무게중심(CG) 자동 계산
        입력된 부품 정보를 바탕으로 로켓의 무게중심을 자동으로 계산하여 표시한다.

        3. 압력중심(CP) 근사 계산
        로켓 형상을 기반으로 압력중심을 근사적으로 계산해 안정성 판단에 활용한다.

        4. 설계 버전(Revision) 관리
        설계 변경 사항을 버전별로 기록하고 이전 설계와 비교할 수 있다.

        5. 시각화 기능
        CG와 CP 위치를 시각적으로 표현하여 설계 변경에 따른 영향을 쉽게 이해할 수 있다.

        6. 팀 설계 협업 지원
        팀원들이 동일한 설계 데이터를 공유하며 설계 방향을 논의할 수 있다.
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
              CP 계산은 근사 모델이므로 실제 비행/풍동/CFD 결과와 차이가 있을 수 있음. 
            </li>
            <li>향후: 로그인 기반 팀 초대 기능, PDF 보고서 자동 생성</li>
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
