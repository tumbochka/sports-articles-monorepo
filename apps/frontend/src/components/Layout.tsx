import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";

type LayoutProps = {
  title?: string;
  children: ReactNode;
};

export function Layout({ title, children }: LayoutProps) {
  const fullTitle = title ? `${title} • Sports Articles` : "Sports Articles";

  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              Sports Articles
            </Link>
            <nav className="space-x-4 text-sm">
              <Link
                href="/"
                className="rounded-md px-3 py-1 text-slate-700 hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/article/new"
                className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create article
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
          {children}
        </main>
        <footer className="border-t bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-slate-500">
            GraphQL backend:{" "}
            <code>{process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql"}</code>
          </div>
        </footer>
      </div>
    </>
  );
}


