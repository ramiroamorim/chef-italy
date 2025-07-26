import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        console.log(`Query retry attempt ${failureCount}:`, error);
        // Não tentar novamente se for erro de rede ou scripts de terceiros
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error detected, possibly due to third-party scripts');
          return failureCount < 1;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'always', // Tentar mesmo se detectar problemas de rede
    },
    mutations: {
      retry: (failureCount, error) => {
        console.log(`Mutation retry attempt ${failureCount}:`, error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          return false; // Não retry para erros de fetch em mutations
        }
        return failureCount < 2;
      },
      networkMode: 'always',
    },
  },
});