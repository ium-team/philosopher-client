import { RequireAuth } from "@/features/auth/components/require-auth";
import { VoiceModePage } from "@/features/service/components/voice-mode-page";

type VoiceRouteProps = {
  searchParams: Promise<{
    conversation?: string | string[];
    philosopher?: string | string[];
    new?: string | string[];
  }>;
};

export default async function ServiceVoiceRoute({ searchParams }: VoiceRouteProps) {
  const params = await searchParams;
  const conversationParam = params.conversation;
  const philosopherParam = params.philosopher;
  const newParam = params.new;
  const conversationId = Array.isArray(conversationParam) ? conversationParam[0] : conversationParam;
  const philosopherId = Array.isArray(philosopherParam) ? philosopherParam[0] : philosopherParam;
  const shouldCreateConversation = (Array.isArray(newParam) ? newParam[0] : newParam) === "1";

  return (
    <RequireAuth>
      <VoiceModePage
        conversationId={conversationId ?? null}
        philosopherId={philosopherId ?? null}
        shouldCreateConversation={shouldCreateConversation}
      />
    </RequireAuth>
  );
}
