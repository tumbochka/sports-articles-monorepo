import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cors from "cors";
import express from "express";
import request from "supertest";

import { SportsArticle } from "../entities/SportsArticle";
import {createResolvers} from "../graphql/resolvers";
import { typeDefs } from "../graphql/schema";

import { testDataSource } from "./setup";

export async function setupTestServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const resolvers = createResolvers(testDataSource);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  app.use("/graphql", expressMiddleware(server));

  return request(app);
}

export async function seedArticles(count: number): Promise<SportsArticle[]> {
  const repo = testDataSource.getRepository(SportsArticle);
  const articles: SportsArticle[] = [];

  for (let i = 0; i < count; i++) {
    const article = repo.create({
      title: `Test Article ${i + 1}`,
      content: `Content for test article ${i + 1}`,
      imageUrl: i % 3 === 0 ? `https://example.com/image-${i + 1}.jpg` : null,
    });
    articles.push(await repo.save(article));
    // Add a small delay to ensure different timestamps for ordering
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  return articles;
}



