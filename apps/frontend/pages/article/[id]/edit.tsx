import type { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { Layout } from "@/components/Layout";
import { ArticleForm, ArticleFormValues } from "@/components/ArticleForm";
import { initializeApollo, addApolloState } from "@/lib/apolloClient";
import { ARTICLE } from "@/graphql/queries";
import { UPDATE_ARTICLE } from "@/graphql/mutations";

type EditPageProps = {
  article: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
  } | null;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export default function EditArticlePage({ article }: EditPageProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const [updateArticle, { loading }] = useMutation(UPDATE_ARTICLE);

  if (!article) {
    return (
      <Layout title="Article not found">
        <p className="text-sm text-slate-600">Article not found.</p>
      </Layout>
    );
  }

  const handleSubmit = async (values: ArticleFormValues) => {
    setServerError(null);
    try {
      const { data } = await updateArticle({
        variables: {
          id: article.id,
          input: values,
        },
      });

      if (data?.updateArticle?.id) {
        await router.push(`/article/${data.updateArticle.id}`);
      }
    } catch (err: any) {
      const message =
        err?.graphQLErrors?.[0]?.message ??
        err?.message ??
        "Failed to update article. Please try again.";
      setServerError(message);
    }
  };

  return (
    <Layout title={`Edit • ${article.title}`}>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Edit article</h1>
        <p className="mt-1 text-sm text-slate-600">
          Make changes to your article. All fields are required except the image URL.
        </p>
      </div>
      <ArticleForm
        initialValues={{
          title: article.title,
          content: article.content,
          imageUrl: article.imageUrl ?? undefined,
        }}
        submitting={loading}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<EditPageProps, Params> = async (
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
