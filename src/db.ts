import 'reflect-metadata';

import * as fs from 'fs';
import * as path from 'path';

import { Connection, createConnection } from 'typeorm';

import config from '../config';

let connection: Connection;

export async function getConnection(): Promise<Connection> {
  if (connection && connection.isConnected) {
    return connection;
  }
  connection = await createConnection(config.db as any);
  return connection;
}

async function getEntities() {
  const conn = await getConnection();
  const entities = [];
  await conn.entityMetadatas.forEach(x =>
    entities.push({ name: x.name, tableName: x.tableName }),
  );
  return entities;
}

async function cleanAll(entities) {
  const conn = await getConnection();
  for (const entity of entities) {
    const repository = await conn.getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName};`);
  }
}

async function loadAll(entities) {
  const conn = await getConnection();
  for (const entity of entities) {
    const repository = await conn.getRepository(entity.name);
    const fixtureFile = path.join(
      __dirname,
      `../test/fixtures/${entity.name}.json`,
    );
    if (fs.existsSync(fixtureFile)) {
      const items = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
      await repository
        .createQueryBuilder(entity.name)
        .insert()
        .values(items)
        .execute();
    }
  }
}

/**
 * Cleans the database and reloads the entries
 */
async function reloadFixtures() {
  const entities = await getEntities();
  await cleanAll(entities);
  await loadAll(entities);
}

export async function flushdb(): Promise<void> {
  await reloadFixtures();
}
