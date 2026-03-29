const BASE = "";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export const api = {
  login: (name: string) =>
    request<{ token: string; user: import("@enlazar/shared").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getMessages: (chatId: string, token: string, skip = 0, limit = 50) =>
    request<import("@enlazar/shared").PaginatedMessages>(
      `/messages/${chatId}?skip=${skip}&limit=${limit}`,
      {},
      token
    ),

  createRoom: (name: string, token: string) =>
    request<{ room: import("@enlazar/shared").ChatRoom }>(
      "/messages/rooms/create",
      { method: "POST", body: JSON.stringify({ name }) },
      token
    ),

  graphql: <T>(
    query: string,
    variables: Record<string, unknown>,
    token?: string | null
  ) =>
    request<{ data: T; errors?: { message: string }[] }>(
      "/graphql",
      { method: "POST", body: JSON.stringify({ query, variables }) },
      token
    ).then((res) => {
      if (res.errors?.length) throw new Error(res.errors[0].message);
      return res.data;
    }),
};
