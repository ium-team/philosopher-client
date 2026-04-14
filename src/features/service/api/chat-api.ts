import { env } from "@/config/env";

export type ApiPhilosopher = "socrates" | "nietzsche" | "hannah_arendt";
export type ApiMessageRole = "user" | "assistant";

export type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  instruction: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiConversation = {
  id: string;
  project_id: string;
  philosopher: ApiPhilosopher;
  title: string | null;
  created_at: string;
};

export type ApiMessage = {
  id: string;
  role: ApiMessageRole;
  content: string;
  created_at: string;
};

export type ApiMessageExchange = {
  user_message: ApiMessage;
  assistant_message: ApiMessage;
};

function getApiBaseUrl(): string {
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");
  }
  return baseUrl.replace(/\/+$/, "");
}

type ApiErrorPayload = {
  detail?: string;
};

async function getErrorMessageFromResponse(response: Response): Promise<string> {
  const fallbackMessage = `API request failed (${response.status})`;
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;

  return payload?.detail ?? fallbackMessage;
}

async function request<T>(
  path: string,
  accessToken: string,
  options?: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessageFromResponse(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function synthesizeSpeech(
  accessToken: string,
  payload: {
    philosopher_id: ApiPhilosopher;
    text: string;
  },
): Promise<Blob> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessageFromResponse(response));
  }

  return response.blob();
}

export function listProjects(accessToken: string): Promise<ApiProject[]> {
  return request<ApiProject[]>("/api/v1/chat/projects", accessToken);
}

export function createProject(
  accessToken: string,
  payload: {
    name: string;
    description?: string;
  },
): Promise<ApiProject> {
  return request<ApiProject>("/api/v1/chat/projects", accessToken, {
    method: "POST",
    body: payload,
  });
}

export function updateProjectPin(
  accessToken: string,
  projectId: string,
  isPinned: boolean,
): Promise<ApiProject> {
  return request<ApiProject>(`/api/v1/chat/projects/${projectId}/pin`, accessToken, {
    method: "PATCH",
    body: { is_pinned: isPinned },
  });
}

export function updateProjectSettings(
  accessToken: string,
  projectId: string,
  payload: {
    name?: string;
    instruction?: string | null;
  },
): Promise<ApiProject> {
  return request<ApiProject>(`/api/v1/chat/projects/${projectId}/settings`, accessToken, {
    method: "PATCH",
    body: payload,
  });
}

export function listConversations(
  accessToken: string,
  projectId: string,
): Promise<ApiConversation[]> {
  return request<ApiConversation[]>(
    `/api/v1/chat/projects/${projectId}/conversations`,
    accessToken,
  );
}

export function createConversation(
  accessToken: string,
  projectId: string,
  payload: {
    philosopher: ApiPhilosopher;
    title?: string;
  },
): Promise<ApiConversation> {
  return request<ApiConversation>(
    `/api/v1/chat/projects/${projectId}/conversations`,
    accessToken,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function createDefaultConversation(
  accessToken: string,
  payload: {
    philosopher: ApiPhilosopher;
    title?: string;
  },
): Promise<ApiConversation> {
  return request<ApiConversation>("/api/v1/chat/conversations", accessToken, {
    method: "POST",
    body: payload,
  });
}

export function moveConversationProject(
  accessToken: string,
  conversationId: string,
  projectId: string | null,
): Promise<ApiConversation> {
  return request<ApiConversation>(
    `/api/v1/chat/conversations/${conversationId}/project`,
    accessToken,
    {
      method: "PATCH",
      body: { project_id: projectId },
    },
  );
}

export function listMessages(
  accessToken: string,
  conversationId: string,
): Promise<ApiMessage[]> {
  return request<ApiMessage[]>(
    `/api/v1/chat/conversations/${conversationId}/messages`,
    accessToken,
  );
}

export function sendMessage(
  accessToken: string,
  conversationId: string,
  content: string,
): Promise<ApiMessageExchange> {
  return request<ApiMessageExchange>(
    `/api/v1/chat/conversations/${conversationId}/messages`,
    accessToken,
    {
      method: "POST",
      body: { content },
    },
  );
}

export function deleteConversation(
  accessToken: string,
  conversationId: string,
): Promise<void> {
  return request<void>(
    `/api/v1/chat/conversations/${conversationId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}

export function deleteProject(
  accessToken: string,
  projectId: string,
): Promise<void> {
  return request<void>(
    `/api/v1/chat/projects/${projectId}`,
    accessToken,
    {
      method: "DELETE",
    },
  );
}
