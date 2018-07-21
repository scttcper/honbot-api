import {MigrationInterface, QueryRunner} from "typeorm";

export class init1532149846491 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "fails" ("id" integer NOT NULL, "attempts" integer NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2062f73a4ab175152257c01b9aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "fails_attempts" ON "fails"("attempts") `);
        await queryRunner.query(`CREATE TABLE "heropicks" ("id" SERIAL NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "hero_id" integer NOT NULL, "loss" integer NOT NULL, "win" integer NOT NULL, CONSTRAINT "PK_506791fde247c5f93202bb85751" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "heropicks_date" ON "heropicks"("hero_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "heropicks_date_hero_id_key" ON "heropicks"("date", "hero_id") `);
        await queryRunner.query(`CREATE TABLE "players" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "nickname" character varying(20) NOT NULL, "lowercaseNickname" character varying(20) NOT NULL, "clan_id" integer NOT NULL, "hero_id" integer NOT NULL, "position" integer NOT NULL, "items" integer array NOT NULL, "team" integer NOT NULL, "level" integer NOT NULL, "win" boolean NOT NULL, "concedes" integer NOT NULL, "concedevotes" integer NOT NULL, "buybacks" integer NOT NULL, "discos" integer NOT NULL, "kicked" integer NOT NULL, "mmr_change" numeric NOT NULL, "herodmg" integer NOT NULL, "kills" integer NOT NULL, "assists" integer NOT NULL, "deaths" integer NOT NULL, "goldlost2death" integer NOT NULL, "secs_dead" integer NOT NULL, "cs" integer NOT NULL, "bdmg" integer NOT NULL, "razed" integer NOT NULL, "denies" integer NOT NULL, "exp_denied" integer NOT NULL, "consumables" integer NOT NULL, "wards" integer NOT NULL, "bloodlust" integer NOT NULL, "doublekill" integer NOT NULL, "triplekill" integer NOT NULL, "quadkill" integer NOT NULL, "annihilation" integer NOT NULL, "ks3" integer NOT NULL, "ks4" integer NOT NULL, "ks5" integer NOT NULL, "ks6" integer NOT NULL, "ks7" integer NOT NULL, "ks8" integer NOT NULL, "ks9" integer NOT NULL, "ks10" integer NOT NULL, "ks15" integer NOT NULL, "smackdown" integer NOT NULL, "humiliation" integer NOT NULL, "nemesis" integer NOT NULL, "retribution" integer NOT NULL, "used_token" integer NOT NULL, "time_earning_exp" integer NOT NULL, "teamcreepkills" integer NOT NULL, "teamcreepdmg" integer NOT NULL, "teamcreepexp" integer NOT NULL, "teamcreepgold" integer NOT NULL, "neutralcreepkills" integer NOT NULL, "neutralcreepdmg" integer NOT NULL, "neutralcreepexp" integer NOT NULL, "neutralcreepgold" integer NOT NULL, "actions" integer NOT NULL, "gold" integer NOT NULL, "exp" double precision NOT NULL, "kdr" double precision NOT NULL, "gpm" double precision NOT NULL, "xpm" double precision NOT NULL, "apm" double precision NOT NULL, "matchId" integer, CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "players_account_id" ON "players"("account_id") `);
        await queryRunner.query(`CREATE INDEX "players_lowercase_nickname" ON "players"("lowercaseNickname") `);
        await queryRunner.query(`CREATE INDEX "players_match_id" ON "players"("matchId") `);
        await queryRunner.query(`CREATE TABLE "matches" ("id" integer NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "length" integer NOT NULL, "version" character varying(12) NOT NULL, "map" character varying(25) NOT NULL, "server_id" integer NOT NULL, "mode" character varying(25) NOT NULL, "type" character varying(20) NOT NULL, "setup_no_repick" integer NOT NULL, "setup_no_agi" integer NOT NULL, "setup_drp_itm" integer NOT NULL, "setup_no_timer" integer NOT NULL, "setup_rev_hs" integer NOT NULL, "setup_no_swap" integer NOT NULL, "setup_no_int" integer NOT NULL, "setup_alt_pick" integer NOT NULL, "setup_veto" integer NOT NULL, "setup_shuf" integer NOT NULL, "setup_no_str" integer NOT NULL, "setup_no_pups" integer NOT NULL, "setup_dup_h" integer NOT NULL, "setup_ap" integer NOT NULL, "setup_br" integer NOT NULL, "setup_em" integer NOT NULL, "setup_cas" integer NOT NULL, "setup_rs" integer NOT NULL, "setup_nl" integer NOT NULL, "setup_officl" integer NOT NULL, "setup_no_stats" integer NOT NULL, "setup_ab" integer NOT NULL, "setup_hardcore" integer NOT NULL, "setup_dev_heroes" integer NOT NULL, "setup_verified_only" integer NOT NULL, "setup_gated" integer NOT NULL, "setup_rapidfire" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trueskills" ("account_id" integer NOT NULL, "mu" double precision NOT NULL DEFAULT 25, "sigma" double precision NOT NULL DEFAULT 8.333333333333334, "games" integer NOT NULL DEFAULT 1, CONSTRAINT "PK_32d708297d81d314f27d7fed602" PRIMARY KEY ("account_id"))`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_5fd858b632798abe653a759da1b" FOREIGN KEY ("matchId") REFERENCES "matches"("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_5fd858b632798abe653a759da1b"`);
        await queryRunner.query(`DROP TABLE "trueskills"`);
        await queryRunner.query(`DROP TABLE "matches"`);
        await queryRunner.query(`DROP INDEX "players_match_id"`);
        await queryRunner.query(`DROP INDEX "players_lowercase_nickname"`);
        await queryRunner.query(`DROP INDEX "players_account_id"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP INDEX "heropicks_date_hero_id_key"`);
        await queryRunner.query(`DROP INDEX "heropicks_date"`);
        await queryRunner.query(`DROP TABLE "heropicks"`);
        await queryRunner.query(`DROP INDEX "fails_attempts"`);
        await queryRunner.query(`DROP TABLE "fails"`);
    }

}
