import "reflect-metadata";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { AppDataSource } from "./data-source";
import { SportsArticle } from "./entities/SportsArticle";
import {IsNull} from "typeorm";
import {sportsArticleInputSchema} from "./validation/SportsArticle";
import {badUserInput, notFound} from "./graphql/errors";

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
    articles: async () => {
      const repo = AppDataSource.getRepository(SportsArticle);
      return repo.find({
        order: { createdAt: "DESC" },
        take: 10,
      });
    },
    article: async (_: unknown, { id }: { id: string }) => {
      const repo = AppDataSource.getRepository(SportsArticle);
      return repo.findOneBy({ id });
    },
  },
  Mutation: {
    createArticle: async (_: unknown, { input }: { input: unknown }) => {
      const parsed = sportsArticleInputSchema.safeParse(input);
      if (!parsed.success) {
        throw badUserInput("Validation error", parsed.error.flatten());
      }

      const repo = AppDataSource.getRepository(SportsArticle);
      const article = repo.create(parsed.data);

      return repo.save(article);
    },
    updateArticle: async (
      _: unknown,
      { id, input }: { id: string; input: unknown }
    ) => {
      const parsed = sportsArticleInputSchema.safeParse(input);
      if (!parsed.success) {
        throw badUserInput("Validation error", parsed.error.flatten());
      }

      const repo = AppDataSource.getRepository(SportsArticle);

      const existing = await repo.findOne({ where: { id } });
      if (!existing) throw notFound("Article not found");

      repo.merge(existing, parsed.data);

      return repo.save(existing);
    },
    deleteArticle: async (_: unknown, { id }: { id: string }) => {
      const repo = AppDataSource.getRepository(SportsArticle);

      const existing = await repo.findOne({ where: { id } });
      if (!existing) return false;

      await repo.softDelete(id);

      return true;
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

  await AppDataSource.initialize();
  console.log("DB connected");

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
