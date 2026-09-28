/**
 * Kleine fetch-wrapper voor de backend API.
 *
 * Alle requests gaan naar `/api/...` op dezelfde origin. Nginx proxyt dat
 * door naar de API container, dus:
 *   - geen CORS configuratie nodig
 *   - het httpOnly sessiecookie gaat automatisch mee
 */

/** Fout met de HTTP status erbij, zodat callers op 401 kunnen reageren. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Bij true wordt een 401 niet als fout gezien, maar als `null` teruggegeven. */
  allowUnauthorized?: boolean;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, allowUnauthorized = false } = options;

  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      // Stuur cookies mee (zelfde origin, maar expliciet is duidelijker).
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(
      "Geen verbinding met de server. Draait de API container?",
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && allowUnauthorized) {
      return null as T;
    }

    const message =
      (payload as { error?: string } | null)?.error ??
      `Serverfout (${response.status}).`;

    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, allowUnauthorized = false) =>
    request<T>(path, { allowUnauthorized }),

  post: <T>(path: string, body?: unknown, allowUnauthorized = false) =>
    request<T>(path, { method: "POST", body, allowUnauthorized }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
};
