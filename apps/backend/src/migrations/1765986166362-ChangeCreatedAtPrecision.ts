import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCreatedAtPrecision1765986166362 implements MigrationInterface {
    name = 'ChangeCreatedAtPrecision1765986166362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sports_articles" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3) WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "sports_articles" ALTER COLUMN "createdAt" SET DEFAULT ('now'::text)::timestamp(3) with time zone`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sports_articles" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sports_articles" ALTER COLUMN "createdAt" TYPE TIMESTAMP(6) WITH TIME ZONE`);
    }

}
