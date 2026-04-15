import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "Philosopher 서비스 이용약관",
};

const effectiveDate = "2026-04-15";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-12 text-[#2a231b] md:px-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <header className="space-y-2 border-b border-[#eadccc] pb-6">
          <p className="text-xs tracking-[0.2em] text-[#d45a1d] uppercase">Terms of Service</p>
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">이용약관</h1>
          <p className="text-sm text-[#6d5e4f]">시행일: {effectiveDate}</p>
        </header>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제1조 (목적)</h2>
          <p>
            본 약관은 Philosopher(이하 서비스)가 제공하는 대화형 AI 철학 서비스의 이용과 관련하여 서비스와 이용자 간의
            권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제2조 (정의)</h2>
          <p>이용자란 본 약관에 따라 서비스에 접속하여 서비스를 이용하는 회원 및 비회원을 의미합니다.</p>
          <p>회원이란 Google 로그인 등 회사가 제공하는 인증 절차를 통해 계정을 생성하고 서비스를 이용하는 자를 의미합니다.</p>
          <p>
            콘텐츠란 이용자가 입력한 질문, 대화 내용, 설정값 및 서비스가 생성하여 제공하는 답변, 음성 등 일체의 정보 또는
            자료를 의미합니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제3조 (약관의 게시와 개정)</h2>
          <p>서비스는 본 약관의 내용을 이용자가 쉽게 확인할 수 있도록 서비스 화면에 게시합니다.</p>
          <p>
            서비스는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일자 및 개정 사유를 적용일자
            7일 전부터 공지합니다.
          </p>
          <p>
            이용자가 개정약관 시행일까지 명시적으로 거부 의사를 표시하지 않고 서비스를 계속 이용하는 경우, 개정약관에 동의한
            것으로 봅니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제4조 (서비스의 제공 및 변경)</h2>
          <p>서비스는 철학자 페르소나 기반 텍스트/음성 대화 기능 및 관련 부가 기능을 제공합니다.</p>
          <p>
            서비스는 운영상, 기술상 필요에 따라 제공 기능을 변경할 수 있으며, 중대한 변경이 있는 경우 사전 공지합니다.
          </p>
          <p>서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검 또는 장애 발생 시 일시 중단될 수 있습니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제5조 (회원가입 및 계정관리)</h2>
          <p>이용자는 서비스가 정한 인증 절차를 거쳐 회원가입을 신청할 수 있으며, 서비스는 특별한 사유가 없는 한 이를 승낙합니다.</p>
          <p>이용자는 계정 정보의 최신성을 유지해야 하며, 계정의 관리 소홀로 발생한 손해에 대한 책임은 이용자에게 있습니다.</p>
          <p>이용자는 제3자에게 계정을 양도, 대여 또는 공유할 수 없습니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제6조 (이용자의 의무)</h2>
          <p>이용자는 관련 법령, 본 약관 및 서비스 운영정책을 준수해야 합니다.</p>
          <p>
            이용자는 다음 행위를 하여서는 안 됩니다: 타인의 권리 침해, 서비스의 안정적 운영 방해, 불법 또는 유해한 정보의
            게시·전송, 자동화 수단을 통한 비정상적 이용 등.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제7조 (콘텐츠 및 지식재산권)</h2>
          <p>이용자가 서비스에 입력한 콘텐츠에 대한 권리와 책임은 해당 이용자에게 있습니다.</p>
          <p>
            서비스가 제공하는 화면, 디자인, 로고, 데이터베이스 등 서비스 자체에 관한 지식재산권은 서비스 또는 정당한 권리자에게
            귀속됩니다.
          </p>
          <p>이용자는 서비스가 제공하는 결과물을 법령 및 제3자 권리를 침해하지 않는 범위에서만 이용해야 합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제8조 (서비스 이용 제한 및 계약 해지)</h2>
          <p>
            서비스는 이용자가 본 약관을 위반하거나 서비스 운영을 방해하는 경우, 사전 통지 후 또는 긴급한 경우 사후 통지로
            이용을 제한할 수 있습니다.
          </p>
          <p>이용자는 언제든지 계정 삭제 또는 탈퇴를 요청할 수 있으며, 서비스는 관련 법령에 따라 이를 처리합니다.</p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제9조 (면책)</h2>
          <p>
            서비스는 천재지변, 불가항력, 이용자 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.
          </p>
          <p>
            서비스에서 제공되는 AI 응답은 정보 제공을 위한 참고 자료이며, 법률·의료·투자 등 전문적 판단을 대체하지 않습니다.
          </p>
          <p>
            이용자는 중요한 의사결정을 하기 전 별도의 전문가 자문을 받아야 하며, AI 응답 이용으로 발생한 손해에 대해 서비스는
            고의 또는 중과실이 없는 한 책임을 지지 않습니다.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-7 text-[#44382d] md:text-base">
          <h2 className="text-lg font-semibold text-[#2a231b]">제10조 (준거법 및 관할)</h2>
          <p>본 약관은 대한민국 법령을 준거법으로 합니다.</p>
          <p>
            서비스와 이용자 간 분쟁이 발생할 경우, 관련 법령에 따른 관할 법원을 제1심 전속적 합의 관할 법원으로 합니다.
          </p>
        </section>

        <footer className="flex flex-wrap items-center gap-4 border-t border-[#eadccc] pt-6 text-sm text-[#6d5e4f]">
          <Link href="/service" className="transition hover:text-[#4f4031]">
            서비스로 돌아가기
          </Link>
          <Link href="/privacy" className="transition hover:text-[#4f4031]">
            개인정보처리방침 보기
          </Link>
        </footer>
      </div>
    </main>
  );
}
