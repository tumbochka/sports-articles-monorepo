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
import { normalizeApolloError } from "@/lib/normalizeApolloError";
import { ErrorBanner } from "@/components/ErrorBanner";

type EditPageProps = {
  article: {
    id: string;
    title: string;
    content: string;
    imageUrl?: string | null;
  } | null;
  ssrErrors?: ReturnType<typeof normalizeApolloError>;
};

interface Params extends ParsedUrlQuery {
  id: string;
}

export default function EditArticlePage({ article, ssrErrors }: EditPageProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const [updateArticle, { loading }] = useMutation(UPDATE_ARTICLE, {
    errorPolicy: "all",
  });

  if (ssrErrors) {
    return (
      <Layout title="Error">
        <ErrorBanner errors={ssrErrors} />
        <p className="text-sm text-slate-600">
          Unable to load article for editing.
        </p>
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

  const handleSubmit = async (values: ArticleFormValues) => {
    setServerError(null);
    try {
      const res = await updateArticle({
        variables: {
          id: article.id,
          input: values,
        },
        errorPolicy: "all",
      });

      // Check for errors in response
      if (res.errors?.length) {
        const normalized = normalizeApolloError(res.errors);
        setServerError(
          normalized[0]?.message ||
            "Failed to update article. Please try again.",
        );
        return;
      }

      if (res.data?.updateArticle?.id) {
        await router.push(`/article/${res.data.updateArticle.id}`);
      }
    } catch (err) {
      const normalized = normalizeApolloError(err);
      setServerError(
        normalized[0]?.message || "Failed to update article. Please try again.",
      );
    }
  };

  return (
    <Layout title={`Edit • ${article.title}`}>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Edit article</h1>
        <p className="mt-1 text-sm text-slate-600">
          Make changes to your article. All fields are required except the image
          URL.
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

export const getServerSideProps: GetServerSideProps<
  EditPageProps,
  Params
> = async (context) => {
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
        (err) => err.extensions?.code === "NOT_FOUND",
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
