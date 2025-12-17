import {AppDataSource} from "../data-source";
import {SportsArticle} from "../entities/SportsArticle";
import {sportsArticleInputSchema} from "../validation/SportsArticle";
import {badUserInput, notFound} from "./errors";
import { decodeCursor, encodeCursor } from "../pagination/cursor";

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
    articlesConnection: async (
      _: unknown,
      args: { first?: number; after?: string | null }
    ) => {
      const firstRaw = args.first ?? 10;
      const first = Math.min(Math.max(firstRaw, 1), 50); // clamp 1..50

      let after: { createdAt: string; id: string } | null = null;
      if (args.after) {
        try {
          after = decodeCursor(args.after);
        } catch {
          throw badUserInput("Invalid cursor");
        }
      }

      const repo = AppDataSource.getRepository(SportsArticle);
      const qb = repo
        .createQueryBuilder("a")
        .orderBy('a.createdAt', 'DESC')
        .addOrderBy('a.id', 'DESC')
        .take(first + 1);

      if (after) {
        qb.andWhere(
          '(a.createdAt, a.id) < (:createdAt, :id)',
          { createdAt: new Date(after.createdAt), id: after.id }
        );
      }

      const rows = await qb.getMany();

      console.log("rows.length", rows.length);
      console.log(qb.getQueryAndParameters());

      const hasNextPage = rows.length > first;
      const nodes = hasNextPage ? rows.slice(0, first) : rows;

      const edges = nodes.map((node) => ({
        node,
        cursor: encodeCursor({ createdAt: node.createdAt.toISOString(), id: node.id }),
      }));

      const endCursor = edges.length ? edges[edges.length - 1].cursor : null;

      return {
        edges,
        pageInfo: { endCursor, hasNextPage },
      };
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
