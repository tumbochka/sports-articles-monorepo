import { z } from "zod";

export const sportsArticleInputSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  content: z.string().trim().min(1, "content is required"),
  imageUrl: z
    .string()
    .trim()
    .url("imageUrl must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

export type SportsArticleInput = z.infer<typeof sportsArticleInputSchema>;
