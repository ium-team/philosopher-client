import { RequireAuth } from "@/features/auth/components/require-auth";
import { VoiceModePage } from "@/features/service/components/voice-mode-page";

type VoiceRouteProps = {
  searchParams: Promise<{
    conversation?: string | string[];
  }>;
};

export default async function ServiceVoiceRoute({ searchParams }: VoiceRouteProps) {
  const params = await searchParams;
  const conversationParam = params.conversation;
  const conversationId = Array.isArray(conversationParam) ? conversationParam[0] : conversationParam;

  return (
    <RequireAuth>
      <VoiceModePage conversationId={conversationId ?? null} />
    </RequireAuth>
  );
}
