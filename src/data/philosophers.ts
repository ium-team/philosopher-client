export type PhilosopherProfile = {
  id: string;
  name: string;
  imageSrc: string;
  era: string;
  school: string;
  tone: string;
  summary: string;
  works: string[];
  promptSamples: string[];
  accentColor: string;
};

export const philosophers: PhilosopherProfile[] = [
  {
    id: "socrates",
    name: "소크라테스",
    imageSrc: "/philosophers/Socrates-cutout-v2.png",
    era: "Ancient Greece",
    school: "Dialectic",
    tone: "질문으로 사고를 파고드는 대화형",
    summary:
      "정답을 먼저 말하지 않고, 질문을 통해 사용자의 생각을 드러내게 만드는 철학자.",
    works: ["Apology", "Crito", "Phaedo"],
    promptSamples: [
      "정의로운 삶은 왜 어려운가?",
      "나는 왜 확신하면서도 자주 틀릴까?",
    ],
    accentColor: "from-cyan-400/30 to-sky-500/10",
  },
  {
    id: "nietzsche",
    name: "니체",
    imageSrc: "/philosophers/Nietzsche-cutout-v2.png",
    era: "19th Century",
    school: "Existential Critique",
    tone: "강렬하고 도발적인 문장으로 각성을 유도",
    summary:
      "기성 도덕과 무비판적 순응을 해체하고, 스스로 가치의 창조자가 되도록 밀어붙이는 철학자.",
    works: [
      "Thus Spoke Zarathustra",
      "Beyond Good and Evil",
      "The Gay Science",
    ],
    promptSamples: [
      "남들이 만든 기준 없이 살아갈 수 있을까?",
      "불안이 나를 더 강하게 만들 수 있을까?",
    ],
    accentColor: "from-amber-400/30 to-orange-500/10",
  },
  {
    id: "arendt",
    name: "한나 아렌트",
    imageSrc: "/philosophers/Hannah Arendt-cutout-v2.png",
    era: "20th Century",
    school: "Political Thought",
    tone: "정치와 책임의 관점에서 현실을 분석",
    summary:
      "사유하지 않는 일상적 순응이 어떻게 위험한 결과를 만드는지 냉정하게 짚는 철학자.",
    works: ["The Human Condition", "Eichmann in Jerusalem", "On Revolution"],
    promptSamples: [
      "생각하지 않는 습관은 왜 위험한가?",
      "공적 삶과 개인의 자유는 어떻게 연결될까?",
    ],
    accentColor: "from-fuchsia-400/25 to-rose-500/10",
  },
  {
    id: "plato",
    name: "플라톤",
    imageSrc: "/philosophers/Plato-cutout-v2.png",
    era: "Ancient Greece",
    school: "Idealism",
    tone: "개념을 체계적으로 정리하며 이데아의 관점으로 질문을 확장",
    summary: "현실의 사례를 통해 본질과 이상을 분리해 사고하게 만드는 철학자.",
    works: ["Republic", "Symposium", "Phaedrus"],
    promptSamples: ["정의로운 국가는 가능할까?", "사랑은 왜 인간을 변화시키는가?"],
    accentColor: "from-indigo-400/30 to-blue-500/10",
  },
  {
    id: "aristotle",
    name: "아리스토텔레스",
    imageSrc: "/philosophers/Aristotle-cutout-v2.png",
    era: "Ancient Greece",
    school: "Peripatetic",
    tone: "경험과 논리를 결합해 실천 가능한 결론을 이끄는 분석형",
    summary: "행복, 덕, 습관의 관계를 현실적 기준으로 풀어내는 철학자.",
    works: ["Nicomachean Ethics", "Politics", "Metaphysics"],
    promptSamples: ["좋은 삶은 무엇으로 판단할 수 있을까?", "덕은 타고나는가, 길러지는가?"],
    accentColor: "from-emerald-400/30 to-teal-500/10",
  },
  {
    id: "descartes",
    name: "르네 데카르트",
    imageSrc: "/philosophers/Rene Descartes-cutout-v2.png",
    era: "17th Century",
    school: "Rationalism",
    tone: "의심을 통해 확실한 근거를 찾는 단계적 추론형",
    summary: "당연해 보이는 믿음을 하나씩 의심하며 사고의 기초를 점검하는 철학자.",
    works: ["Meditations", "Discourse on the Method", "Principles of Philosophy"],
    promptSamples: ["무엇을 확실히 안다고 말할 수 있을까?", "이성만으로 진리에 도달할 수 있을까?"],
    accentColor: "from-slate-400/30 to-zinc-500/10",
  },
  {
    id: "kant",
    name: "임마누엘 칸트",
    imageSrc: "/philosophers/Immanuel Kant-cutout-v2.png",
    era: "18th Century",
    school: "Critical Philosophy",
    tone: "엄밀한 개념 구분으로 도덕과 인식의 조건을 따지는 규범형",
    summary: "행위의 결과보다 원칙과 의무의 보편성을 중심으로 판단하게 만드는 철학자.",
    works: ["Critique of Pure Reason", "Groundwork of the Metaphysics of Morals", "Critique of Practical Reason"],
    promptSamples: ["옳은 행동은 결과보다 의도에 달렸을까?", "자유는 왜 도덕의 전제가 되는가?"],
    accentColor: "from-violet-400/30 to-purple-500/10",
  },
  {
    id: "confucius",
    name: "공자",
    imageSrc: "/philosophers/Confucius-cutout-v2.png",
    era: "Spring and Autumn Period",
    school: "Confucianism",
    tone: "관계와 예를 중심으로 삶의 균형을 권하는 성찰형",
    summary: "개인의 수양과 공동체의 질서를 연결해 일상의 판단 기준을 제시하는 철학자.",
    works: ["Analects", "Book of Rites", "Spring and Autumn Annals"],
    promptSamples: ["좋은 리더는 어떤 태도를 가져야 할까?", "배움은 왜 평생 지속되어야 할까?"],
    accentColor: "from-amber-400/30 to-yellow-500/10",
  },
  {
    id: "simone_de_beauvoir",
    name: "시몬 드 보부아르",
    imageSrc: "/philosophers/Simone de Beauvoir-cutout-v2.png",
    era: "20th Century",
    school: "Existential Feminism",
    tone: "사회 구조와 개인의 자유를 함께 비판적으로 읽어내는 탐구형",
    summary: "정체성과 역할이 어떻게 만들어지는지 분석하며 선택의 책임을 묻는 철학자.",
    works: ["The Second Sex", "The Ethics of Ambiguity", "The Coming of Age"],
    promptSamples: ["나는 얼마나 스스로를 선택하며 살고 있을까?", "자유는 왜 타인의 자유와 함께 생각해야 할까?"],
    accentColor: "from-rose-400/30 to-pink-500/10",
  },
];
