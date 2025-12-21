import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCursorIndex1766053289081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE INDEX "IDX_sports_articles_cursor_active"
          ON "sports_articles" ("createdAt" DESC, "id" DESC)
          WHERE "deletedAt" IS NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "IDX_sports_articles_cursor_active"
        `);
  }
}
