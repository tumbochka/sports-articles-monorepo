import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765965956967 implements MigrationInterface {
    name = 'Init1765965956967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Using pgcrypto + gen_random_uuid() for UUID generation
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`CREATE TABLE "sports_articles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" text NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "imageUrl" text, CONSTRAINT "PK_f9cbfe35ea2d2308b98f4c1b140" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9cbfe35ea2d2308b98f4c1b14" ON "sports_articles" ("id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_f9cbfe35ea2d2308b98f4c1b14"`);
        await queryRunner.query(`DROP TABLE "sports_articles"`);
    }

}
