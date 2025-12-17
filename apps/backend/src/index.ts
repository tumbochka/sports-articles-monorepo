import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import cors from "cors";
import express from "express";

import { AppDataSource } from "./data-source";
import { createResolvers } from "./graphql/resolvers";
import { typeDefs } from  "./graphql/schema"


async function start() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const resolvers = createResolvers(AppDataSource);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await AppDataSource.initialize();
  console.log("DB connected");

  await server.start();

  app.use("/graphql", expressMiddleware(server));

  const port = Number(process.env.PORT ?? 4000);
  const httpServer = app.listen(port, () => {
    console.log(`Backend ready on http://localhost:${port}/graphql`);
  });


  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received, shutting down...`);

    try {
      await server.stop();
    } catch {
      // noop
    }

    try {
      await AppDataSource.destroy();
    } catch {
      // noop
    }

    await new Promise<void>((resolve) => httpServer?.close(() => resolve()));
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
