import { dehydrate, hydrate, QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  // ✅ Global QueryClient defaults
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,   // 5 min: treat cached data as fresh
        gcTime: 1000 * 60 * 30,     // 30 min: keep unused cache in memory
        refetchOnWindowFocus: false, // avoid surprise refetches on tab switch
        retry: 1,                   // fail fast (1 retry only)
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: "intent",          // prefetch on hover/touch before click
    defaultPreloadStaleTime: 1000 * 60 * 5,
    scrollRestoration: true,
    // ✅ SSR Hydration sync: dehydrate query cache on server, hydrate into client QueryClient
    dehydrate: () => ({
      queryClientState: dehydrate(queryClient) as any,
    }),
    hydrate: (dehydratedState: any) => {
      if (dehydratedState?.queryClientState) {
        hydrate(queryClient, dehydratedState.queryClientState);
      }
    },
  });

  return router;
};
