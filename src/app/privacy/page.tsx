import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Philosopher 서비스 개인정보처리방침",
};

const effectiveDate = "2026-04-15";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-12 text-[#2a231b] md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2 border-b border-[#eadccc] pb-6">
          <p className="text-xs tracking-[0.2em] text-[#d45a1d] uppercase">Privacy Policy</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">개인정보처리방침</h1>
          <p className="text-sm text-[#6d5e4f]">시행일: {effectiveDate}</p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">1. 총칙</h2>
          <p>
            Philosopher(이하 서비스)는 이용자의 개인정보를 중요하게 생각하며, 개인정보보호 관련 법령을 준수합니다. 본
            개인정보처리방침은 서비스가 어떤 정보를 수집하고, 어떻게 이용 및 보호하는지 안내합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">2. 수집하는 개인정보 항목</h2>
          <p>서비스는 다음 개인정보를 수집할 수 있습니다.</p>
          <p>필수 항목: OAuth 기반 로그인 식별 정보(이메일, 사용자 고유 식별자), 서비스 이용 기록(접속 로그, 대화 생성/수정 기록)</p>
          <p>선택 항목: 이용자가 프로필 또는 입력창에 자발적으로 입력한 추가 정보</p>
          <p>자동 수집 항목: IP 주소, 브라우저 정보, 기기 정보, 쿠키/세션 정보, 이용 시간</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">3. 개인정보 수집 방법</h2>
          <p>회원가입 및 로그인 과정에서 이용자가 직접 제공</p>
          <p>서비스 이용 과정에서 시스템 로그 및 쿠키를 통한 자동 수집</p>
          <p>고객 문의 또는 오류 신고 과정에서 이용자가 추가 제공</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">4. 개인정보 이용 목적</h2>
          <p>회원 식별, 본인 인증, 계정 관리 및 서비스 제공</p>
          <p>대화 이력 저장, 개인화 기능 제공, 서비스 품질 개선</p>
          <p>보안, 부정 이용 방지, 법령 준수 및 분쟁 대응</p>
          <p>공지사항 전달, 문의 응답 등 고객지원</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">5. 개인정보 보유 및 이용 기간</h2>
          <p>서비스는 개인정보 수집·이용 목적이 달성된 후 지체 없이 파기합니다.</p>
          <p>
            다만, 관계 법령에 따라 일정 기간 보관이 필요한 경우 해당 법령에서 정한 기간 동안 안전하게 보관합니다.
          </p>
          <p>
            회원이 탈퇴를 요청하는 경우, 관련 법령 또는 분쟁 대응에 필요한 최소한의 정보를 제외하고 즉시 또는 합리적인 기간
            내 파기합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">6. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 단, 이용자가 사전에 동의한 경우 또는 법령에
            특별한 규정이 있는 경우에 한해 제공할 수 있습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">7. 개인정보 처리의 위탁</h2>
          <p>서비스 제공을 위해 필요한 범위에서 아래와 같이 처리 업무를 위탁할 수 있습니다.</p>
          <p>인증 및 사용자 계정 연동: Google OAuth</p>
          <p>데이터 저장 및 인증 인프라: Supabase</p>
          <p>클라우드/호스팅 및 운영 인프라: 서비스 운영 환경에 따라 사용되는 사업자</p>
          <p>서비스는 수탁자가 개인정보를 안전하게 처리하도록 계약 및 관리·감독을 수행합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">8. 이용자의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의철회를 요청할 수 있습니다.</p>
          <p>
            권리 행사는 서비스 내 제공 기능 또는 문의 채널을 통해 할 수 있으며, 서비스는 관련 법령에 따라 지체 없이 조치합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">9. 개인정보 파기 절차 및 방법</h2>
          <p>파기 사유가 발생한 개인정보는 지체 없이 파기합니다.</p>
          <p>전자적 파일은 복구 불가능한 기술적 방법으로 삭제하고, 출력물은 분쇄 또는 소각 등으로 파기합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">10. 개인정보의 안전성 확보 조치</h2>
          <p>접근 권한 관리, 최소 권한 부여, 인증정보 보호 등 관리적 조치</p>
          <p>암호화, 접근통제, 로그 모니터링 등 기술적 조치</p>
          <p>서버 및 저장소 보호를 위한 물리적·환경적 보호 조치</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">11. 쿠키 및 유사 기술의 사용</h2>
          <p>
            서비스는 로그인 유지, 보안, 이용자 경험 개선을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다. 이용자는 브라우저
            설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으나, 일부 기능 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">12. 개인정보 보호책임자 및 문의</h2>
          <p>개인정보 관련 문의, 불만 처리, 권리 행사 요청은 아래 채널로 접수할 수 있습니다.</p>
          <p>문의 채널: 서비스 내 문의 기능 또는 운영자가 별도 고지한 연락처</p>
          <p>서비스는 접수된 요청에 대해 지체 없이 답변 및 처리합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">13. 방침 변경</h2>
          <p>본 방침 내용 추가, 삭제 및 수정이 있는 경우 적용일자 7일 전부터 서비스 화면을 통해 공지합니다.</p>
          <p>다만, 이용자 권리에 중대한 변경이 있는 경우 더 충분한 사전 공지 기간을 둘 수 있습니다.</p>
        </section>

        <footer className="flex flex-wrap items-center gap-4 border-t border-[#eadccc] pt-6 text-sm text-[#6d5e4f]">
          <Link href="/service" className="transition hover:text-[#4f4031]">
            서비스로 돌아가기
          </Link>
          <Link href="/terms" className="transition hover:text-[#4f4031]">
            이용약관 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
