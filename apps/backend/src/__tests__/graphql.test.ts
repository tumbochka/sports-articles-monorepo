import { SportsArticle } from "../entities/SportsArticle";

import { setupTestServer, seedArticles } from "./helpers";
import { testDataSource } from "./setup";

describe("GraphQL Integration Tests", () => {
  describe("Health Check", () => {
    it("should return 'ok' for health query", async () => {
      const server = await setupTestServer();

      const query = `
        query {
          health
        }
      `;

      const response = await server
        .post("/graphql")
        .send({ query })
        .expect(200);

      expect(response.body.data.health).toBe("ok");
      expect(response.body.errors).toBeUndefined();
    });
  });

  describe("articlesConnection - First Page", () => {
    it("should return first 5 articles with pagination info", async () => {
      await seedArticles(10);
      const server = await setupTestServer();

      const query = `
        query {
          articlesConnection(first: 5) {
            edges {
              cursor
              node {
                id
                title
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;

      const response = await server
        .post("/graphql")
        .send({ query })
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data).toBeDefined();

      const { edges, pageInfo } = response.body.data.articlesConnection;

      expect(edges.length).toBe(5);
      expect(pageInfo.endCursor).not.toBeNull();
      expect(pageInfo.hasNextPage).toBe(true);

      // Verify cursor format
      edges.forEach((edge: { cursor: string; node: SportsArticle }) => {
        expect(edge.cursor).toBeDefined();
        expect(edge.node.id).toBeDefined();
        expect(edge.node.title).toBeDefined();
      });
    });
  });

  describe("articlesConnection - Second Page", () => {
    it("should return next page using cursor without duplicates", async () => {
      await seedArticles(10);
      const server = await setupTestServer();

      // Get first page
      const firstPageQuery = `
        query {
          articlesConnection(first: 5) {
            edges {
              cursor
              node {
                id
                title
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;

      const firstPageResponse = await server
        .post("/graphql")
        .send({ query: firstPageQuery })
        .expect(200);

      const firstPageData = firstPageResponse.body.data.articlesConnection;
      const endCursor = firstPageData.pageInfo.endCursor;

      expect(endCursor).not.toBeNull();

      // Get second page using cursor
      const secondPageQuery = `
        query {
          articlesConnection(first: 5, after: "${endCursor}") {
            edges {
              cursor
              node {
                id
                title
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;

      const secondPageResponse = await server
        .post("/graphql")
        .send({ query: secondPageQuery })
        .expect(200);

      expect(secondPageResponse.body.errors).toBeUndefined();

      const secondPageData = secondPageResponse.body.data.articlesConnection;
      const secondPageIds = secondPageData.edges.map((e: { node: SportsArticle }) => e.node.id);
      const firstPageIds = firstPageData.edges.map((e: { node: SportsArticle }) => e.node.id);

      // Verify no duplicates
      const allIds = [...firstPageIds, ...secondPageIds];
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);

      // Verify ordering (first page should be newer than second page)
      // Since we order by createdAt DESC, first page items should have later timestamps
      const repo = testDataSource.getRepository(SportsArticle);
      const firstPageArticles = await repo
        .createQueryBuilder("a")
        .where("a.id IN (:...ids)", { ids: firstPageIds })
        .getMany();
      const secondPageArticles = await repo
        .createQueryBuilder("a")
        .where("a.id IN (:...ids)", { ids: secondPageIds })
        .getMany();

      if (firstPageArticles.length > 0 && secondPageArticles.length > 0) {
        const firstPageLatestDate = Math.max(
          ...firstPageArticles.map((a) => a.createdAt.getTime())
        );
        const secondPageLatestDate = Math.max(
          ...secondPageArticles.map((a) => a.createdAt.getTime())
        );
        expect(firstPageLatestDate).toBeGreaterThanOrEqual(secondPageLatestDate);
      }

      // Verify cursor changes
      expect(secondPageData.pageInfo.endCursor).not.toBe(firstPageData.pageInfo.endCursor);
    });

    it("should set hasNextPage to false when on last page", async () => {
      await seedArticles(8);
      const server = await setupTestServer();

      // Get first page of 5
      const firstPageQuery = `
        query {
          articlesConnection(first: 5) {
            edges {
              cursor
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;

      const firstPageResponse = await server
        .post("/graphql")
        .send({ query: firstPageQuery })
        .expect(200);

      const firstPageData = firstPageResponse.body.data.articlesConnection;
      expect(firstPageData.pageInfo.hasNextPage).toBe(true);

      // Get remaining items (should be 3, less than 5)
      const secondPageQuery = `
        query {
          articlesConnection(first: 5, after: "${firstPageData.pageInfo.endCursor}") {
            edges {
              cursor
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;

      const secondPageResponse = await server
        .post("/graphql")
        .send({ query: secondPageQuery })
        .expect(200);

      const secondPageData = secondPageResponse.body.data.articlesConnection;
      expect(secondPageData.pageInfo.hasNextPage).toBe(false);
    });
  });

  describe("articlesConnection - Soft Delete", () => {
    it("should exclude soft-deleted articles from results", async () => {
      const articles = await seedArticles(10);
      const server = await setupTestServer();

      // Get initial count
      const initialQuery = `
        query {
          articlesConnection(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;

      const initialResponse = await server
        .post("/graphql")
        .send({ query: initialQuery })
        .expect(200);

      const initialCount = initialResponse.body.data.articlesConnection.edges.length;
      expect(initialCount).toBe(10);

      // Soft delete one article
      const articleToDelete = articles[0];
      const repo = testDataSource.getRepository(SportsArticle);
      await repo.softDelete(articleToDelete.id);

      // Verify it's not returned in articlesConnection
      const afterDeleteQuery = `
        query {
          articlesConnection(first: 10) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;

      const afterDeleteResponse = await server
        .post("/graphql")
        .send({ query: afterDeleteQuery })
        .expect(200);

      const afterDeleteEdges = afterDeleteResponse.body.data.articlesConnection.edges;
      const afterDeleteIds = afterDeleteEdges.map((e: { node: SportsArticle }) => e.node.id);

      // Verify deleted article is not in results
      expect(afterDeleteIds).not.toContain(articleToDelete.id);

      // Verify count decreased by one
      expect(afterDeleteEdges.length).toBe(initialCount - 1);
    });
  });
});

