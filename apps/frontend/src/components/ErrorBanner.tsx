import type { NormalizedError } from "@/lib/normalizeApolloError";

type ErrorBannerProps = {
  message?: string;
  errors?: NormalizedError[];
};

export function ErrorBanner({ message, errors }: ErrorBannerProps) {
  if (!message && !errors?.length) return null;

  const displayErrors = errors?.length
    ? errors.map((e) => e.message)
    : message
      ? [message]
      : [];

  if (displayErrors.length === 0) return null;

  return (
    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {displayErrors.length === 1 ? (
        <p>{displayErrors[0]}</p>
      ) : (
        <ul className="list-disc list-inside space-y-1">
          {displayErrors.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
