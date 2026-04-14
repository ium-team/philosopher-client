import { RequireAuth } from "@/features/auth/components/require-auth";
import { VoiceModePage } from "@/features/service/components/voice-mode-page";

type VoiceRouteProps = {
  searchParams: Promise<{
    conversation?: string | string[];
    philosopher?: string | string[];
  }>;
};

export default async function ServiceVoiceRoute({ searchParams }: VoiceRouteProps) {
  const params = await searchParams;
  const conversationParam = params.conversation;
  const philosopherParam = params.philosopher;
  const conversationId = Array.isArray(conversationParam) ? conversationParam[0] : conversationParam;
  const philosopherId = Array.isArray(philosopherParam) ? philosopherParam[0] : philosopherParam;

  return (
    <RequireAuth>
      <VoiceModePage conversationId={conversationId ?? null} philosopherId={philosopherId ?? null} />
    </RequireAuth>
  );
}
