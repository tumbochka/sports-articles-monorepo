import type { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { initializeApollo, addApolloState } from "@/lib/apolloClient";
import { ARTICLE } from "@/graphql/queries";
import { formatDateTime } from "@/lib/formatDate";
import { normalizeApolloError } from "@/lib/normalizeApolloError";
import { ErrorBanner } from "@/components/ErrorBanner";

type ArticlePageProps = {
  article: {
    id: string;
    title: string;
    content: string;
    createdAt: string | null;
    imageUrl?: string | null;
  } | null;
  ssrErrors?: ReturnType<typeof normalizeApolloError>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export default function ArticlePage({ article, ssrErrors }: ArticlePageProps) {
  if (ssrErrors) {
    return (
      <Layout title="Error">
        <ErrorBanner errors={ssrErrors} />
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          ← Back to list
        </Link>
      </Layout>
    );
  }

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

  try {
    const res = await apolloClient.query({
      query: ARTICLE,
      variables: { id },
      errorPolicy: "all",
    });

    // Check for NOT_FOUND errors
    if (res.errors?.length) {
      const notFoundError = res.errors.find(
        (err) => err.extensions?.code === "NOT_FOUND"
      );
      if (notFoundError) {
        return {
          notFound: true,
        };
      }
      // Other errors - return with ssrErrors
      return {
        props: addApolloState(apolloClient, {
          article: null,
          ssrErrors: normalizeApolloError(res.errors),
        }),
      };
    }

    const article = res.data?.article
      ? {
          id: res.data.article.id,
          title: res.data.article.title,
          content: res.data.article.content,
          createdAt: res.data.article.createdAt ?? null,
          imageUrl: res.data.article.imageUrl ?? null,
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
  } catch (e) {
    const normalized = normalizeApolloError(e);
    const notFoundError = normalized.find((err) => err.code === "NOT_FOUND");
    if (notFoundError) {
      return {
        notFound: true,
      };
    }
    return {
      props: addApolloState(apolloClient, {
        article: null,
        ssrErrors: normalized,
      }),
    };
  }
};
