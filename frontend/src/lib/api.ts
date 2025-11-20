export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T = unknown>(
  path: string,
  { token, headers, ...rest }: ApiFetchOptions = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && (data as { detail?: string }).detail) ||
      (typeof data === "string" ? data : "Error desconocido");
    throw new Error(message);
  }

  return data as T;
}

