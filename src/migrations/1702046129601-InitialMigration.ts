import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1702046129601 implements MigrationInterface {
  name = 'InitialMigration1702046129601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE if not exists "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deviceId" character varying NOT NULL DEFAULT '', "appleId" character varying NOT NULL DEFAULT '', "balance" integer NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'active', "expirationDate" TIMESTAMP NOT NULL DEFAULT now(), "appVersion" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE if not exists "purchases" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL DEFAULT '', "transactionId" character varying NOT NULL DEFAULT '', "productId" character varying NOT NULL DEFAULT '', "creditsAmount" integer NOT NULL DEFAULT '0', "transaction" text NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1d55032f37a34c6eceacbbca6b8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE if not exists "withdrawals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL DEFAULT '', "tokensAmount" integer NOT NULL DEFAULT '0', "creditsAmount" integer NOT NULL DEFAULT '0', "balanceBefore" integer NOT NULL DEFAULT '0', "balanceAfter" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9871ec481baa7755f8bd8b7c7e9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "withdrawals"`);
    await queryRunner.query(`DROP TABLE "purchases"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
