import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableCoupon1745638317304 implements MigrationInterface {
    name = 'CreateTableCoupon1745638317304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."coupons_unit_enum" AS ENUM('percent', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "coupons" ("id" SERIAL NOT NULL, "value" numeric NOT NULL, "description" character varying NOT NULL, "unit" "public"."coupons_unit_enum" NOT NULL, "quantity" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "update_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "couponId" integer`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_88eb3534a66ee147cd920c843d6" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_88eb3534a66ee147cd920c843d6"`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "couponId"`);
        await queryRunner.query(`DROP TABLE "coupons"`);
        await queryRunner.query(`DROP TYPE "public"."coupons_unit_enum"`);
    }

}
