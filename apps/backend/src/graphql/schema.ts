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
