import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  DeleteDateColumn,
} from "typeorm";

@Entity({ name: "sports_articles" })
export class SportsArticle {
  @PrimaryGeneratedColumn("uuid")
  @Index()
  id!: string;

  @Column({ type: "text" })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ type: "timestamptz", precision: 3, default: () => "CURRENT_TIMESTAMP(3)" })
  createdAt!: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt!: Date | null;

  @Column({ type: "text", nullable: true })
  imageUrl!: string | null;
}
