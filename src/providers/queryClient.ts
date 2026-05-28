import { QueryClient } from "@tanstack/react-query";

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        retry: 1,
        staleTime: 10000,
        gcTime: 60000,
        throwOnError: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

let queryClient: QueryClient | null = null;

export function initializeQueryClient(): void {
  if (typeof window === "undefined") {
    queryClient = createQueryClient();
  } else {
    if (!queryClient) {
      queryClient = createQueryClient();
    }
  }
}

initializeQueryClient();

export function getQueryClient(): QueryClient {
  return queryClient!;
}
