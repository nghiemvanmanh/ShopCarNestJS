import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentsRelationToOrders1745662477974 implements MigrationInterface {
    name = 'AddPaymentsRelationToOrders1745662477974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "REL_af929a5f2a400fdb6913b4967e"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "orderId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentsId" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_6151af79b89fee4657b94dd094d" FOREIGN KEY ("paymentsId") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_6151af79b89fee4657b94dd094d"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentsId"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD "orderId" integer`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "REL_af929a5f2a400fdb6913b4967e" UNIQUE ("orderId")`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
