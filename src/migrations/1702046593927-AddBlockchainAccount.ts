import { MigrationInterface, QueryRunner } from 'typeorm';
import * as process from 'process';
const Web3 = require('web3');

const web3 = new Web3();
const secret = process.env.SECRET_PHRASE || '';

export class AddBlockchainAccount1702046593927 implements MigrationInterface {
  name = 'AddBlockchainAccount1702046593927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "address" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "privateKey" character varying NOT NULL DEFAULT ''`,
    );

    const users: { id: string; appleId: string }[] = await queryRunner.query(
      `SELECT id, "appleId" from "users" where "privateKey" = '' and "appleId" <> '';`,
    );
    console.log(`Account to migrate: ${users.length}`);
    for (const user of users) {
      const { id, appleId } = user;
      const pk = web3.utils.sha3(`${secret}_${appleId}`);
      const account = web3.eth.accounts.privateKeyToAccount(pk);
      await queryRunner.query(
        `UPDATE users set "privateKey" = $1, "address" = $2 where "id" = $3`,
        [account.privateKey, account.address, id],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "privateKey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
  }
}
