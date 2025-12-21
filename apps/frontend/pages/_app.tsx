import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@/lib/apolloClient";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

export default function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.apolloState);

  return (
    <AppErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </AppErrorBoundary>
  );
}
