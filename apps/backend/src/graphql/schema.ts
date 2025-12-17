export const typeDefs = /* GraphQL */ `
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

        articlesConnection(first: Int = 10, after: String): SportsArticleConnection!
    }

    input SportArticleInput {
        title: String!
        content: String!
        imageUrl: String
    }

    type Mutation {
        createArticle(input: SportArticleInput!): SportsArticle!
        updateArticle(id: ID!, input: SportArticleInput!): SportsArticle!
        deleteArticle(id: ID!): Boolean!
    }

    type SportsArticleEdge {
        cursor: String!
        node: SportsArticle!
    }

    type PageInfo {
        endCursor: String
        hasNextPage: Boolean!
    }

    type SportsArticleConnection {
        edges: [SportsArticleEdge!]!
        pageInfo: PageInfo!
    }
`;
