import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "Philosopher 서비스 개인정보 처리방침",
};

const effectiveDate = "2026-04-15";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-12 text-[#2a231b] md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2 border-b border-[#eadccc] pb-6">
          <p className="text-xs tracking-[0.2em] text-[#d45a1d] uppercase">Privacy Policy</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">개인정보 처리방침</h1>
          <p className="text-sm text-[#6d5e4f]">시행일: {effectiveDate}</p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">1. 총칙</h2>
          <p>
            Philosopher(이하 서비스)는 이용자의 개인정보를 중요하게 생각하며, 개인정보 보호법 등 관련 법령을 준수합니다. 본
            방침은 서비스가 수집하는 개인정보 항목, 이용 목적, 보관 기간 및 이용자 권리를 안내합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">2. 수집하는 개인정보 항목</h2>
          <p>필수 항목: OAuth 로그인 식별 정보(이메일, 사용자 식별자), 서비스 이용 기록(접속 로그, 대화 생성·수정 기록)</p>
          <p>선택 항목: 이용자가 프로필 또는 입력창에 자발적으로 입력한 추가 정보</p>
          <p>자동 수집 항목: IP 주소, 브라우저 및 기기 정보, 쿠키·세션 정보, 접속 일시</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">3. 개인정보 수집 방법</h2>
          <p>회원가입 및 로그인 과정에서 이용자가 직접 제공</p>
          <p>서비스 이용 과정에서 시스템 로그, 쿠키 등 기술적 수단을 통한 자동 수집</p>
          <p>문의 또는 오류 제보 과정에서 이용자가 추가 제공</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">4. 개인정보 이용 목적</h2>
          <p>회원 식별, 본인 인증, 계정 관리</p>
          <p>대화 이력 저장, 개인화 기능 제공, 서비스 품질 개선</p>
          <p>보안 모니터링, 부정 이용 방지, 법령 준수 및 분쟁 대응</p>
          <p>공지사항 전달 및 고객지원</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">5. 개인정보 보유 및 이용 기간</h2>
          <p>개인정보는 수집·이용 목적 달성 시 지체 없이 파기합니다.</p>
          <p>다만, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.</p>
          <p>예시: 계약 또는 청약철회 등에 관한 기록 5년, 소비자 불만 또는 분쟁처리 기록 3년, 접속 로그 3개월</p>
          <p>회원 탈퇴 시에도 법령상 보존 의무가 없는 정보는 즉시 또는 합리적 기간 내 파기합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">6. 개인정보의 제3자 제공</h2>
          <p>
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 단, 이용자 동의가 있거나 법령에 따른 경우에는
            예외로 합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">7. 개인정보 처리 위탁 및 국외 이전</h2>
          <p>서비스 제공을 위해 필요한 범위에서 외부 서비스에 개인정보 처리를 위탁할 수 있습니다.</p>
          <p>인증 및 계정 연동: Google OAuth</p>
          <p>데이터 저장 및 인증 인프라: Supabase</p>
          <p>
            위 서비스 이용 과정에서 개인정보가 해외 서버에 저장 또는 처리될 수 있으며, 서비스는 관련 법령에 따라 안전조치를
            적용합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">8. 이용자의 권리 및 행사 방법</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지, 동의철회를 요청할 수 있습니다.</p>
          <p>권리 행사는 아래 문의 이메일로 요청할 수 있으며, 서비스는 법령에 따라 지체 없이 조치합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">9. 개인정보 파기 절차 및 방법</h2>
          <p>파기 사유가 발생한 개인정보는 지체 없이 파기합니다.</p>
          <p>전자 파일은 복구가 어려운 기술적 방법으로 삭제하고, 출력물은 분쇄 또는 소각하여 파기합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">10. 개인정보의 안전성 확보 조치</h2>
          <p>접근 권한 최소화, 인증정보 보호, 내부 접근 통제</p>
          <p>전송 구간 보호, 저장 데이터 보호, 접속 기록 관리</p>
          <p>보안 사고 예방을 위한 관리적·기술적 보호조치 시행</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">11. 쿠키의 사용</h2>
          <p>
            서비스는 로그인 유지, 보안, 사용자 경험 개선을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을
            거부하거나 삭제할 수 있으나, 일부 기능 사용이 제한될 수 있습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">12. 아동의 개인정보</h2>
          <p>서비스는 만 14세 미만 아동을 대상으로 하지 않습니다.</p>
          <p>만 14세 미만 아동의 개인정보가 확인되는 경우 관련 법령에 따라 지체 없이 필요한 조치를 취합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">13. 개인정보 문의</h2>
          <p>개인정보 관련 문의, 불만 처리, 권리 행사 요청은 아래 이메일로 접수할 수 있습니다.</p>
          <p>문의 이메일: hello@ium.dev</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">14. 방침 변경</h2>
          <p>본 방침의 내용이 추가, 삭제 또는 수정되는 경우 적용일자 7일 전부터 서비스 화면을 통해 공지합니다.</p>
          <p>이용자 권리에 중대한 변경이 있는 경우 합리적인 기간 동안 별도 안내할 수 있습니다.</p>
        </section>

        <footer className="flex flex-wrap items-center gap-4 border-t border-[#eadccc] pt-6 text-sm text-[#6d5e4f]">
          <Link href="/service" className="transition hover:text-[#4f4031]">
            서비스로 돌아가기
          </Link>
          <Link href="/terms" className="transition hover:text-[#4f4031]">
            서비스 이용약관 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
