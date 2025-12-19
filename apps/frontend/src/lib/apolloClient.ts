import {ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject} from "@apollo/client";
import {useMemo} from "react";
import merge from "deepmerge";
import isEqual from "lodash.isequal";

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  const uri = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: new HttpLink({
      uri,
      fetch,
    }),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo(initialState: NormalizedCacheObject | null = null) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    const data = merge(existingCache, initialState, {
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s))),
      ],
    });
    _apolloClient.cache.restore(data);
  }

  if (typeof window === "undefined") {
    return _apolloClient;
  }

  if (!apolloClient) {
    apolloClient = _apolloClient;
  }

  return _apolloClient;
}

export function addApolloState(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: Record<string, unknown>
) {
  return {
    ...pageProps,
    apolloState: client.cache.extract(),
  };
}

export function useApollo(initialState: NormalizedCacheObject | null) {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
