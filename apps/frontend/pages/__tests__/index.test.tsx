import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import type { NormalizedCacheObject } from "@apollo/client";
import IndexPage from "../index";
import { ARTICLES_CONNECTION } from "@/graphql/queries";
import { DELETE_ARTICLE } from "@/graphql/mutations";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  }),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/head
jest.mock("next/head", () => {
  return ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };
});

// Mock react-virtuoso
let endReachedCallback: (() => void) | null = null;
jest.mock("react-virtuoso", () => {
  const React = require("react");
  return {
    Virtuoso: ({
      data,
      endReached,
      itemContent,
    }: {
      data?: unknown[];
      endReached?: () => void;
      itemContent: (index: number, item: unknown) => React.ReactNode;
    }) => {
      // Store the endReached callback so we can call it manually in tests
      React.useEffect(() => {
        endReachedCallback = endReached ?? null;
      }, [endReached]);

      // Sync items with data prop (which updates when Apollo's updateQuery runs)
      const items = data || [];

      return (
        <div data-testid="virtuoso-list">
          {items.map((item: unknown, index: number) => (
            <div
              key={
                (item && typeof item === "object" && "id" in item
                  ? String(item.id)
                  : null) || index
              }
              data-testid={`virtuoso-item-${index}`}
            >
              {itemContent(index, item)}
            </div>
          ))}
        </div>
      );
    },
  };
});

// Helper to manually trigger endReached in tests
const triggerEndReached = () => {
  if (endReachedCallback) {
    endReachedCallback();
  }
};

const PAGE_SIZE = 10;

const mockArticlesPage1 = {
  articlesConnection: {
    __typename: "ArticlesConnection",
    edges: [
      {
        cursor: "cursor1",
        node: {
          id: "1",
          title: "First Article",
          createdAt: "2024-01-01T00:00:00Z",
          imageUrl: null,
        },
      },
      {
        cursor: "cursor2",
        node: {
          id: "2",
          title: "Second Article",
          createdAt: "2024-01-02T00:00:00Z",
          imageUrl: "https://example.com/image.jpg",
        },
      },
    ],
    pageInfo: {
      endCursor: "cursor2",
      hasNextPage: true,
    },
  },
};

const mockArticlesPage2 = {
  articlesConnection: {
    __typename: "ArticlesConnection",
    edges: [
      {
        cursor: "cursor3",
        node: {
          id: "3",
          title: "Third Article (Page 2)",
          createdAt: "2024-01-03T00:00:00Z",
          imageUrl: null,
        },
      },
      {
        cursor: "cursor4",
        node: {
          id: "4",
          title: "Fourth Article (Page 2)",
          createdAt: "2024-01-04T00:00:00Z",
          imageUrl: null,
        },
      },
    ],
    pageInfo: {
      endCursor: "cursor4",
      hasNextPage: false,
    },
  },
};

describe("IndexPage", () => {
  beforeEach(() => {
    // Reset window.confirm mock before each test
    jest.spyOn(window, "confirm").mockImplementation(() => true);
    // Reset endReached callback
    endReachedCallback = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    endReachedCallback = null;
  });

  describe("Renders initial SSR/hydrated list data", () => {
    it("renders first item title from initial query", async () => {
      const mocks = [
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: { first: PAGE_SIZE },
          },
          result: {
            data: mockArticlesPage1,
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <IndexPage apolloState={{}} ssrErrors={null} />
        </MockedProvider>,
      );

      // Wait for the query to complete and article to render
      await waitFor(() => {
        expect(screen.getByText("First Article")).toBeInTheDocument();
      });

      // Verify the first article title is rendered
      expect(screen.getByText("First Article")).toBeInTheDocument();
      expect(screen.getByText("Second Article")).toBeInTheDocument();
    });
  });

  describe("Delete flow", () => {
    it("deletes article and refetches list when confirmed", async () => {
      const userEventInstance = userEvent.setup();

      const refetchResult = {
        articlesConnection: {
          __typename: "ArticlesConnection",
          edges: [
            {
              cursor: "cursor2",
              node: {
                id: "2",
                title: "Second Article",
                createdAt: "2024-01-02T00:00:00Z",
                imageUrl: "https://example.com/image.jpg",
              },
            },
          ],
          pageInfo: {
            endCursor: "cursor2",
            hasNextPage: false,
          },
        },
      };

      const mocks = [
        // Initial query - this must match first
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: { first: PAGE_SIZE },
          },
          result: {
            data: mockArticlesPage1,
          },
        },
        {
          request: {
            query: DELETE_ARTICLE,
            variables: { id: "1" },
          },
          result: {
            data: {
              deleteArticle: true,
            },
          },
        },
        // Refetch query - when refetch is called with after: null
        // Note: Apollo may normalize after: null, so we need to handle both cases
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: { first: PAGE_SIZE, after: null },
          },
          result: {
            data: refetchResult,
          },
        },
        // Also handle case where after might be normalized away
        // This will only be used if the above doesn't match
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: { first: PAGE_SIZE },
          },
          result: {
            data: refetchResult,
          },
          // Use newData to ensure this is only used for refetch, not initial query
          newData: () => ({
            data: refetchResult,
          }),
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <IndexPage apolloState={{}} ssrErrors={null} />
        </MockedProvider>,
      );

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText("First Article")).toBeInTheDocument();
      });

      // Find and click the delete button for the first article
      const deleteButtons = screen.getAllByText("Delete");
      const firstDeleteButton = deleteButtons[0];

      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);

      // Click delete button
      await userEventInstance.click(firstDeleteButton);

      // Wait for the delete mutation to complete and refetch to happen
      // The refetch should remove the deleted article
      await waitFor(
        () => {
          expect(screen.queryByText("First Article")).not.toBeInTheDocument();
        },
        { timeout: 5000 },
      );

      // Verify the deleted article is gone
      expect(screen.queryByText("First Article")).not.toBeInTheDocument();
      // Verify other articles remain
      expect(screen.getByText("Second Article")).toBeInTheDocument();
    });
  });

  describe("Infinite loading trigger", () => {
    it("triggers fetchMore when endReached is called and appends new items", async () => {
      const mocks = [
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: { first: PAGE_SIZE },
          },
          result: {
            data: mockArticlesPage1,
          },
        },
        {
          request: {
            query: ARTICLES_CONNECTION,
            variables: {
              first: PAGE_SIZE,
              after: "cursor2",
            },
          },
          result: {
            data: mockArticlesPage2,
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks}>
          <IndexPage apolloState={{}} ssrErrors={null} />
        </MockedProvider>,
      );

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText("First Article")).toBeInTheDocument();
      });

      // Verify initial articles are rendered
      expect(screen.getByText("First Article")).toBeInTheDocument();
      expect(screen.getByText("Second Article")).toBeInTheDocument();

      // Manually trigger endReached to simulate scrolling to the end
      await act(async () => {
        triggerEndReached();
      });

      // Wait for the second page to load and new items to appear
      await waitFor(
        () => {
          expect(
            screen.getByText("Third Article (Page 2)"),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Verify new items from page 2 are appended
      expect(screen.getByText("Third Article (Page 2)")).toBeInTheDocument();
      expect(screen.getByText("Fourth Article (Page 2)")).toBeInTheDocument();

      // Verify original items are still present
      expect(screen.getByText("First Article")).toBeInTheDocument();
      expect(screen.getByText("Second Article")).toBeInTheDocument();
    });
  });
});
