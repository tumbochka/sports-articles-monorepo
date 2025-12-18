import { useState, FormEvent } from "react";

export type ArticleFormValues = {
  title: string;
  content: string;
  imageUrl?: string | null;
};

type ArticleFormProps = {
  initialValues?: ArticleFormValues;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: ArticleFormValues) => Promise<void> | void;
};

export function ArticleForm({
  initialValues,
  submitting,
  serverError,
  onSubmit,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [touched, setTouched] = useState<{ title?: boolean; content?: boolean }>({});

  const titleError = !title.trim() && touched.title ? "Title is required" : "";
  const contentError = !content.trim() && touched.content ? "Content is required" : "";
  const hasClientErrors = Boolean(titleError || contentError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, content: true });
    if (!title.trim() || !content.trim()) {
      return;
    }
    await onSubmit({
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl?.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-md border bg-white p-4 shadow-sm"
    >
      {serverError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {serverError}
        </p>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Title
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
          />
        </label>
        {titleError ? (
          <p className="mt-1 text-xs text-red-600">{titleError}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Content
          <textarea
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, content: true }))}
          />
        </label>
        {contentError ? (
          <p className="mt-1 text-xs text-red-600">{contentError}</p>
        ) : null}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Image URL (optional)
          <input
            type="url"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
            value={imageUrl ?? ""}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting || hasClientErrors}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}


