import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { useMemo } from "react";
import merge from "deepmerge";
import isEqual from "fast-deep-equal";

let apolloClient: ApolloClient<NormalizedCacheObject> | null = null;

function createApolloClient() {
  const uri =
    process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors?.length) {
      for (const err of graphQLErrors) {
        // лог для дебага; пізніше можна toast / sentry
        console.warn("[GraphQL error]", {
          op: operation.operationName,
          message: err.message,
          code: err.extensions?.code,
          field: err.extensions?.field,
        });
      }
    }
    if (networkError) {
      console.warn("[Network error]", {
        op: operation.operationName,
        message:
          networkError instanceof Error
            ? networkError.message
            : String(networkError),
      });
    }
  });

  const httpLink = new HttpLink({
    uri,
    fetch,
  });

  return new ApolloClient<NormalizedCacheObject>({
    ssrMode: typeof window === "undefined",
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      // ключове: не кидати виняток на GraphQL errors
      query: { errorPolicy: "all" },
      watchQuery: { errorPolicy: "all" },
      mutate: { errorPolicy: "all" },
    },
  });
}

export function initializeApollo(
  initialState: NormalizedCacheObject | null = null,
) {
  const _apolloClient = apolloClient ?? createApolloClient();

  if (initialState) {
    const existingCache = _apolloClient.extract();
    const data = merge(existingCache, initialState, {
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s)),
        ),
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

export function addApolloState<T extends Record<string, unknown>>(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: T,
): T & { apolloState: NormalizedCacheObject } {
  return {
    ...pageProps,
    apolloState: client.cache.extract(),
  };
}

export function useApollo(initialState: NormalizedCacheObject | null) {
  return useMemo(() => initializeApollo(initialState), [initialState]);
}
