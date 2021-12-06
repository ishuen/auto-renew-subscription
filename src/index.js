import {MongoClient} from 'mongodb';
import fs from 'fs';
import {Console} from 'console';
import * as config from '../config.json';
import {getListenKey, subscribeUserData, unsubscribe} from './userData.js';
const {dbUri} = config.default;
const KEY_RENEW_TIME = 1000 * 60 * 50; // 50 mins
const MAX_RENEWAL = 23; // 24hr connection limit
const MAX_ITERATION = 3; // default to roughly 3 days

/**
 * handleStream function
 * @param {MongoClient} client A MongoClient
 * @param {object} loggers An object with multiple loggers: appLogger, dbLogger
 */
async function handleStream(client, loggers) {
  const wsRef = await getListenKey()
      .then((key) => subscribeUserData(key, client, loggers))
      .catch(console.error);

  await autoRenew(wsRef, loggers.appLogger);
}

/**
 * auto renew listen key
 * @param {WebSocket} wsRef Websocket instance
 * @param {Console} logger Application logger
 */
async function autoRenew(wsRef, logger) {
  for (let i = 1; i <= MAX_RENEWAL; i++) {
    await new Promise((resolve) => setTimeout(resolve, KEY_RENEW_TIME));
    logger.info(`Renewed key: ${i} times`);
    getListenKey();
  }
  unsubscribe(wsRef, logger);
}

/**
 * Main function
 * @param {object} loggers An object with multiple loggers: appLogger, dbLogger
 */
async function main(loggers) {
  const client = new MongoClient(dbUri);
  await client.connect();
  for (let i = 0; i < MAX_ITERATION; i++) {
    await handleStream(client, loggers);
  }
  process.exit();
}

const appLogger = new Console({
  stdout: fs.createWriteStream('./logs/application.log'),
  stderr: fs.createWriteStream('./logs/error.log'),
});
const dbLogger = new Console({
  stdout: fs.createWriteStream('./logs/db.log'),
  stderr: fs.createWriteStream('./logs/db-error.log'),
});
main({appLogger, dbLogger}).catch(appLogger.error);
