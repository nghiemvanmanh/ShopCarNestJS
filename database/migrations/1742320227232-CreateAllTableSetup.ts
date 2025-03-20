import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTableSetup1742320227232 implements MigrationInterface {
  name = 'CreateAllTableSetup1742320227232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" SERIAL NOT NULL, "rating" integer NOT NULL, "comment" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "productId" integer, CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric NOT NULL, "stock" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "price" numeric NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" SERIAL NOT NULL, "amount" numeric NOT NULL, "payment_method" character varying NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "orderId" integer, CONSTRAINT "REL_af929a5f2a400fdb6913b4967e" UNIQUE ("orderId"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" SERIAL NOT NULL, "total_amount" numeric NOT NULL, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "email" character varying NOT NULL, "role" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "update_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_a6b3c434392f5d10ec171043666" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_a6b3c434392f5d10ec171043666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_7ed5659e7139fc8bc039198cc1f"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
