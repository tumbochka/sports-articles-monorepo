import { gql } from "@apollo/client";

export const ARTICLES_CONNECTION = gql`
  query ArticlesConnection($first: Int, $after: String) {
    articlesConnection(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          title
          createdAt
          imageUrl
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const ARTICLE = gql`
  query Article($id: ID!) {
    article(id: $id) {
      id
      title
      content
      createdAt
      imageUrl
    }
  }
`;
