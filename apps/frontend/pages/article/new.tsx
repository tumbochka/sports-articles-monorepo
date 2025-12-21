import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { Layout } from "@/components/Layout";
import { ArticleForm, ArticleFormValues } from "@/components/ArticleForm";
import { CREATE_ARTICLE } from "@/graphql/mutations";
import { normalizeApolloError } from "@/lib/normalizeApolloError";

export default function NewArticlePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const [createArticle, { loading }] = useMutation(CREATE_ARTICLE, {
    errorPolicy: "all",
  });

  const handleSubmit = async (values: ArticleFormValues) => {
    setServerError(null);
    try {
      const res = await createArticle({
        variables: { input: values },
        errorPolicy: "all",
      });

      // Check for errors in response
      if (res.errors?.length) {
        const normalized = normalizeApolloError(res.errors);
        setServerError(
          normalized[0]?.message ||
            "Failed to create article. Please try again.",
        );
        return;
      }

      if (res.data?.createArticle?.id) {
        await router.push(`/article/${res.data.createArticle.id}`);
      }
    } catch (err) {
      const normalized = normalizeApolloError(err);
      setServerError(
        normalized[0]?.message || "Failed to create article. Please try again.",
      );
    }
  };

  return (
    <Layout title="Create article">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-900">Create article</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill out the form below to publish a new sports article.
        </p>
      </div>
      <ArticleForm
        submitting={loading}
        serverError={serverError}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
}
