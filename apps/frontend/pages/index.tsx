import type { GetServerSideProps } from "next";
import Link from "next/link";
import { Layout } from "@/components/Layout";
import { initializeApollo, addApolloState } from "@/lib/apolloClient";
import { ARTICLES_CONNECTION } from "@/graphql/queries";
import { DELETE_ARTICLE } from "@/graphql/mutations";
import { useMutation, useQuery, NetworkStatus } from "@apollo/client";
import type { NormalizedCacheObject } from "@apollo/client";
import { useRef } from "react";
import { Virtuoso } from "react-virtuoso";
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
    __typename?: string;
    edges: ArticlesConnectionEdge[];
    pageInfo: PageInfo;
  };
};

type ArticlesConnectionVars = {
  first?: number;
  after?: string | null;
};

type IndexPageProps = {
  apolloState?: NormalizedCacheObject;
};

export default function IndexPage(_: IndexPageProps) {
  const lastCursorRef = useRef<string | null>(null);

  const { data, loading, fetchMore, refetch, networkStatus } = useQuery<
    ArticlesConnectionData,
    ArticlesConnectionVars
  >(ARTICLES_CONNECTION, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });

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

  const handleEndReached = async () => {
    if (!pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    if (networkStatus === NetworkStatus.fetchMore) return;
    if (lastCursorRef.current === pageInfo.endCursor) return;

    lastCursorRef.current = pageInfo.endCursor;
    await fetchMore({
      variables: {
        first: PAGE_SIZE,
        after: pageInfo.endCursor,
      },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previousResult;
        return {
          articlesConnection: {
            ...fetchMoreResult.articlesConnection,
            edges: [
              ...previousResult.articlesConnection.edges,
              ...fetchMoreResult.articlesConnection.edges,
            ],
          },
        };
      },
    });
  };

  return (
    <Layout title="Articles">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Latest articles</h1>
      </div>
      {loading && !data ? (
        <p className="text-sm text-slate-600">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-slate-600">No articles yet.</p>
      ) : (
        <div className="flex-1 min-h-0">
          <Virtuoso
            data={articles}
            endReached={handleEndReached}
            style={{ height: "calc(100vh - 160px)" }}
            components={{
              Footer: () =>
                networkStatus === NetworkStatus.fetchMore ? (
                  <div className="py-3 text-center text-sm text-slate-500">
                    Loading more...
                  </div>
                ) : null,
            }}
            itemContent={(_index, article) => (
              <div className="mb-2 flex items-center justify-between rounded-md border bg-white px-4 py-3 shadow-sm">
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
              </div>
            )}
          />
        </div>
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


