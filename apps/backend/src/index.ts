import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";

const typeDefs = /* GraphQL */ `
  type SportsArticle {
    id: ID!
    title: String!
    content: String!
    createdAt: String
    deletedAt: String
    imageUrl: String
  }

  type Query {
    health: String!
    articles: [SportsArticle!]!
    article(id: ID!): SportsArticle
  }

  input ArticleInput {
    title: String!
    content: String!
    imageUrl: String
  }

  type Mutation {
    createArticle(input: ArticleInput!): SportsArticle!
    updateArticle(id: ID!, input: ArticleInput!): SportsArticle!
    deleteArticle(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    health: () => "ok",
    articles: () => [],
    article: () => null,
  },
  Mutation: {
    createArticle: () => {
      throw new Error("Not implemented");
    },
    updateArticle: () => {
      throw new Error("Not implemented");
    },
    deleteArticle: () => {
      throw new Error("Not implemented");
    },
  },
};

async function start() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Backend ready on http://localhost:${port}/graphql`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
