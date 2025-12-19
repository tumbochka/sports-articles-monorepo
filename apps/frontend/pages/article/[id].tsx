import type { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { initializeApollo, addApolloState } from "@/lib/apolloClient";
import { ARTICLE } from "@/graphql/queries";
import { formatDateTime } from "@/lib/formatDate";

type ArticlePageProps = {
  article: {
    id: string;
    title: string;
    content: string;
    createdAt: string | null;
    imageUrl?: string | null;
  } | null;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export default function ArticlePage({ article }: ArticlePageProps) {
  if (!article) {
    return (
      <Layout title="Article not found">
        <p className="text-sm text-slate-600">Article not found.</p>
      </Layout>
    );
  }

  return (
    <Layout title={article.title}>
      <article className="space-y-4 rounded-md border bg-white p-4 shadow-sm">
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">{article.title}</h1>
          {article.createdAt ? (
            <p className="text-xs text-slate-500">
              Published {formatDateTime(article.createdAt)}
            </p>
          ) : null}
        </header>
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={article.title}
            className="max-h-80 w-full rounded-md object-cover"
          />
        ) : null}
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">
          {article.content}
        </p>
      </article>
      <div className="mt-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Back to list
        </Link>
        <Link
          href={`/article/${article.id}/edit`}
          className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
        >
          Edit article
        </Link>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<ArticlePageProps, Params> = async (
  context
) => {
  const { id } = context.params as Params;
  const apolloClient = initializeApollo();

  const { data } = await apolloClient.query({
    query: ARTICLE,
    variables: { id },
  });

  const article = data.article
    ? {
        id: data.article.id,
        title: data.article.title,
        content: data.article.content,
        createdAt: data.article.createdAt ?? null,
        imageUrl: data.article.imageUrl ?? null,
      }
    : null;

  if (!article) {
    return {
      notFound: true,
    };
  }

  return {
    props: addApolloState(apolloClient, {
      article,
    }),
  };
};
