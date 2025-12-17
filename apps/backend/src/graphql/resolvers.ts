import {AppDataSource} from "../data-source";
import {SportsArticle} from "../entities/SportsArticle";
import {sportsArticleInputSchema} from "../validation/SportsArticle";
import {badUserInput, notFound} from "./errors";

export  const resolvers = {
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
