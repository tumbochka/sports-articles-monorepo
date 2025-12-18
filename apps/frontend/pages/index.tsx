import type { GetServerSideProps } from "next";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { initializeApollo, addApolloState } from "@/lib/apolloClient";
import { ARTICLES_CONNECTION } from "@/graphql/queries";
import { DELETE_ARTICLE } from "@/graphql/mutations";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";
import { useEffect, useRef, useCallback } from "react";
import { formatDateTime } from "@/lib/formatDate";

const PAGE_SIZE = 10;

type ArticleNode = {
  id: string;
  title: string;
  createdAt: string | null;
  imageUrl?: string | null;
};

type ArticlesConnectionEdge = {
  cursor: string;
  node: ArticleNode;
};

type PageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
};

type ArticlesConnectionData = {
  articlesConnection: {
    edges: ArticlesConnectionEdge[];
    pageInfo: PageInfo;
  };
};

type ArticlesConnectionVars = {
  first?: number;
  after?: string | null;
};

type IndexPageProps = Record<string, never>;

export default function IndexPage(_: IndexPageProps) {

  const { data, loading, fetchMore, refetch, networkStatus } = useQuery<
    ArticlesConnectionData,
    ArticlesConnectionVars
  >(ARTICLES_CONNECTION, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;

  const [deleteArticle] = useMutation(DELETE_ARTICLE, {
    onError: () => {
      // Keep UI simple: just alert, no persistent banner
      // eslint-disable-next-line no-alert
      alert("Failed to delete article. Please try again.");
    },
  });

  const edges = data?.articlesConnection.edges ?? [];
  const articles: ArticleNode[] = edges.map((edge) => edge.node);
  const pageInfo = data?.articlesConnection.pageInfo;

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm("Are you sure you want to delete this article?");
    if (!confirmed) return;
    const res = await deleteArticle({ variables: { id } });
    if (res.data?.deleteArticle) {
      await refetch({ first: PAGE_SIZE, after: null });
    }
  };

  const lastCursorRef = useRef<string | null>(null);

  const loadMore = useCallback(async () => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    if (isFetchingMore) return;
    if (lastCursorRef.current === pageInfo.endCursor) return;
    lastCursorRef.current = pageInfo.endCursor;

    await fetchMore({
      variables: { first: PAGE_SIZE, after: pageInfo.endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          articlesConnection: {
            ...fetchMoreResult.articlesConnection,
            edges: [
              ...prev.articlesConnection.edges,
              ...fetchMoreResult.articlesConnection.edges,
            ],
          },
        };
      },
    });
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, isFetchingMore, fetchMore]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    if (!pageInfo?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: "600px",
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, pageInfo?.hasNextPage]);

  return (
    <Layout title="Articles">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Latest articles</h1>
        <Link
          href="/article/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create article
        </Link>
      </div>
      {loading && !data ? (
        <p className="text-sm text-slate-600">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-slate-600">No articles yet.</p>
      ) : (
        <>
          <ul className="space-y-2">
            {articles.map((article) => (
              <li
                key={article.id}
                className="flex items-center justify-between rounded-md border bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {article.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-12 w-20 rounded object-cover"
                    />
                  ) : null}
                  <div>
                    <Link
                      href={`/article/${article.id}`}
                      className="text-sm font-medium text-slate-900 hover:underline"
                    >
                      {article.title}
                    </Link>
                    {article.createdAt ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(article.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Link
                    href={`/article/${article.id}/edit`}
                    className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(article.id)}
                    className="rounded-md border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div ref={sentinelRef} className="h-10"/>
          {pageInfo?.hasNextPage ? (
            <p className="mt-2 text-sm text-slate-500">
              {isFetchingMore ? "Loading more..." : "Scroll to load more"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No more articles.</p>
          )}
        </>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
  const apolloClient = initializeApollo();

  await apolloClient.query<ArticlesConnectionData, ArticlesConnectionVars>({
    query: ARTICLES_CONNECTION,
    variables: { first: PAGE_SIZE },
  });

  return {
    props: addApolloState(apolloClient, {}),
  };
};


