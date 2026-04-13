export type PhilosopherProfile = {
  id: string;
  name: string;
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
    name: "Socrates",
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
    name: "Nietzsche",
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
    name: "Hannah Arendt",
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
];
