import { GraphQLError } from "graphql";

export function badUserInput(message: string, details?: unknown) {
  return new GraphQLError(message, {
    extensions: { code: "BAD_USER_INPUT", details },
  });
}

export function notFound(message: string) {
  return new GraphQLError(message, {
    extensions: { code: "NOT_FOUND" },
  });
}
