/**
 * Runs a JSON HTTP request and throws on non-success responses.
 *
 * @param input - Request URL.
 * @param init - Fetch options.
 * @returns Parsed JSON response.
 * @throws When the response is not ok.
 */
export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    next: init?.next ?? { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${response.url}`);
  }

  return response.json() as Promise<T>;
}
