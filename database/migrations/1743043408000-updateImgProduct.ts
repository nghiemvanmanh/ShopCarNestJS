import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateImgProduct1743043408000 implements MigrationInterface {
  name = 'UpdateImgProduct1743043408000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "image" character varying NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
  }
}
