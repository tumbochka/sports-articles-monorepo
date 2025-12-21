import "dotenv/config";
import { AppDataSource } from "./data-source";
import { SportsArticle } from "./entities/SportsArticle";

async function seed() {
  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(SportsArticle);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`Seed skipped: already have ${existing} articles`);
    await AppDataSource.destroy();
    return;
  }

  const items = Array.from({ length: 150 }).map((_, i) => {
    return repo.create({
      title: `Seeded article #${i + 1}`,
      content: `This is the content for seeded article #${i + 1}.`,
      imageUrl:
        i % 3 === 0 ? `https://picsum.photos/seed/${i + 1}/800/400` : null,
      deletedAt: null,
    });
  });

  await repo.save(items);
  console.log(`Seed completed: ${items.length} articles`);

  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
