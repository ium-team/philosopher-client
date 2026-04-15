import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 이용약관",
  description: "Philosopher 서비스 이용약관",
};

const effectiveDate = "2026-04-15";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-12 text-[#2a231b] md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2 border-b border-[#eadccc] pb-6">
          <p className="text-xs tracking-[0.2em] text-[#d45a1d] uppercase">Terms of Service</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">서비스 이용약관</h1>
          <p className="text-sm text-[#6d5e4f]">시행일: {effectiveDate}</p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제1조 (목적)</h2>
          <p>
            본 약관은 Philosopher(이하 서비스)의 이용과 관련하여 서비스 운영자와 이용자 간 권리, 의무 및 책임사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제2조 (정의)</h2>
          <p>이용자란 본 약관에 따라 서비스에 접속하여 서비스를 이용하는 회원 및 비회원을 의미합니다.</p>
          <p>회원이란 Google 로그인 등 서비스가 정한 인증 절차를 통해 계정을 생성한 이용자를 의미합니다.</p>
          <p>
            콘텐츠란 이용자가 입력한 질문, 대화 내용, 설정값 및 서비스가 생성·제공하는 답변, 음성 등 일체의 정보 또는 자료를
            의미합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제3조 (약관의 게시, 효력 및 변경)</h2>
          <p>본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.</p>
          <p>
            서비스는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 시행일자 및 개정 사유를 적용일자 7일
            전부터 공지합니다.
          </p>
          <p>
            이용자가 개정 약관의 시행일 이후에도 서비스를 계속 이용하는 경우, 개정 약관에 동의한 것으로 간주할 수 있습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제4조 (서비스의 제공 및 변경)</h2>
          <p>서비스는 철학자 페르소나 기반 텍스트/음성 대화 및 관련 기능을 제공합니다.</p>
          <p>서비스는 운영상 또는 기술상 필요 시 제공 내용을 변경할 수 있으며, 중대한 변경은 사전에 공지합니다.</p>
          <p>
            서비스는 연중무휴 24시간 제공을 원칙으로 하나, 점검, 장애, 통신사 사정, 불가항력 사유로 일시 중단될 수 있습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제5조 (회원가입 및 계정 관리)</h2>
          <p>이용자는 서비스가 정한 절차에 따라 회원가입을 신청하며, 서비스는 특별한 사유가 없는 한 이를 승낙합니다.</p>
          <p>회원은 계정 정보의 정확성과 최신성을 유지해야 하며, 계정 관리 소홀로 발생한 손해는 회원 책임입니다.</p>
          <p>회원은 본인 계정을 제3자에게 양도, 대여, 공유할 수 없습니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제6조 (이용자의 의무 및 금지행위)</h2>
          <p>이용자는 관련 법령, 본 약관, 서비스 안내 및 운영정책을 준수해야 합니다.</p>
          <p>
            이용자는 다음 행위를 해서는 안 됩니다: 타인 권리 침해, 불법 또는 유해 정보 전송, 서비스 보안 침해, 비정상적 자동화
            호출, 서비스 운영 방해 행위.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제7조 (콘텐츠 및 지식재산권)</h2>
          <p>이용자가 서비스에 입력한 콘텐츠에 대한 권리와 책임은 이용자에게 있습니다.</p>
          <p>
            서비스의 상호, 디자인, 로고, 소프트웨어 및 데이터베이스 등 서비스 자체에 관한 권리는 서비스 운영자 또는 정당한
            권리자에게 귀속됩니다.
          </p>
          <p>이용자는 법령 및 제3자 권리를 침해하지 않는 범위에서만 서비스 결과물을 이용해야 합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제8조 (이용 제한 및 계약 해지)</h2>
          <p>
            서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적 운영을 방해하는 경우, 경고, 이용 제한, 계정 정지 또는 해지
            조치를 할 수 있습니다.
          </p>
          <p>이용자는 언제든지 탈퇴를 요청할 수 있으며, 서비스는 관련 법령에 따라 이를 처리합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제9조 (면책 및 책임 제한)</h2>
          <p>서비스는 천재지변, 장애, 불가항력 또는 이용자 귀책 사유로 인한 손해에 대해 책임을 지지 않습니다.</p>
          <p>AI 응답은 일반적 정보 제공을 위한 참고 자료이며, 법률·의료·투자 등 전문 자문을 대체하지 않습니다.</p>
          <p>
            이용자는 중요한 의사결정 전에 별도 전문가 자문을 받아야 하며, 서비스는 고의 또는 중과실이 없는 한 간접손해 및
            특별손해에 대해 책임을 제한합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제10조 (준거법 및 관할)</h2>
          <p>본 약관은 대한민국 법령을 준거법으로 합니다.</p>
          <p>서비스와 이용자 간 분쟁은 관련 법령에 따른 관할 법원을 제1심 관할 법원으로 합니다.</p>
        </section>

        <footer className="flex flex-wrap items-center gap-4 border-t border-[#eadccc] pt-6 text-sm text-[#6d5e4f]">
          <Link href="/service" className="transition hover:text-[#4f4031]">
            서비스로 돌아가기
          </Link>
          <Link href="/privacy" className="transition hover:text-[#4f4031]">
            개인정보 처리방침 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
