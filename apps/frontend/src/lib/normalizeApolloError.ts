import { ApolloError } from "@apollo/client";
import { GraphQLError } from "graphql";

export type NormalizedError = {
  message: string;
  code: string | null;
  field: string | null;
};

/**
 * Normalizes Apollo errors into a consistent format for UI display.
 * Supports:
 * - ApolloError (from catch blocks)
 * - GraphQLError[] (from res.errors)
 * - Single GraphQLError
 */
export function normalizeApolloError(
  errorOrErrors: ApolloError | GraphQLError[] | GraphQLError | Error | unknown
): NormalizedError[] {
  // Handle ApolloError
  if (errorOrErrors && typeof errorOrErrors === "object" && "graphQLErrors" in errorOrErrors) {
    const apolloError = errorOrErrors as ApolloError;
    const errors: NormalizedError[] = [];

    // GraphQL errors
    if (apolloError.graphQLErrors?.length) {
      for (const err of apolloError.graphQLErrors) {
        errors.push({
          message: err.message,
          code: (err.extensions?.code as string) ?? null,
          field: (err.extensions?.field as string) ?? null,
        });
      }
    }

    // Network errors
    if (apolloError.networkError) {
      errors.push({
        message:
          (apolloError.networkError as any)?.message ??
          apolloError.networkError.toString() ??
          "Network error occurred",
        code: "NETWORK_ERROR",
        field: null,
      });
    }

    // If no specific errors, use the main message
    if (errors.length === 0 && apolloError.message) {
      errors.push({
        message: apolloError.message,
        code: null,
        field: null,
      });
    }

    return errors;
  }

  // Handle GraphQLError[]
  if (Array.isArray(errorOrErrors)) {
    return errorOrErrors.map((err) => ({
      message: err.message,
      code: (err.extensions?.code as string) ?? null,
      field: (err.extensions?.field as string) ?? null,
    }));
  }

  // Handle single GraphQLError
  if (errorOrErrors && typeof errorOrErrors === "object" && "message" in errorOrErrors) {
    const err = errorOrErrors as GraphQLError;
    return [
      {
        message: err.message,
        code: (err.extensions?.code as string) ?? null,
        field: (err.extensions?.field as string) ?? null,
      },
    ];
  }

  // Handle generic Error
  if (errorOrErrors instanceof Error) {
    return [
      {
        message: errorOrErrors.message || "An error occurred",
        code: null,
        field: null,
      },
    ];
  }

  // Fallback
  return [
    {
      message: String(errorOrErrors || "An unknown error occurred"),
      code: null,
      field: null,
    },
  ];
}

