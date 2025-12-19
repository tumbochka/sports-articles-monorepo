import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@/lib/apolloClient";

export default function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps.apolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
