import React from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatDate";

type ArticleRowProps = {
  article: {
    id: string;
    title: string;
    createdAt: string | null;
    imageUrl?: string | null;
  };
  onDelete: (id: string) => void;
};

export const ArticleRow = React.memo<ArticleRowProps>(
  ({ article, onDelete }) => {
    return (
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
            onClick={() => onDelete(article.id)}
            className="rounded-md border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    );
  },
);

ArticleRow.displayName = "ArticleRow";
