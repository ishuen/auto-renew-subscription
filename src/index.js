import {MongoClient} from 'mongodb';
import * as config from '../config.json';
import {getListenKey, subscribeUserData, unsubscribe} from './userData.js';
const {dbUri} = config.default;
const KEY_RENEW_TIME = 1000 * 60 * 50; // 50 mins
const MAX_RENEWAL = 23; // 24hr connection limit
const MAX_ITERATION = 3; // default to roughly 3 days

/**
 * handleStream function
 * @param {MongoClient} client A MongoClient
 */
async function handleStream(client) {
  const wsRef = await getListenKey()
      .then((key) => subscribeUserData(key, client))
      .catch((e) => console.log());

  await autoRenew(wsRef);
}

/**
 * auto renew listen key
 * @param {WebSocket} wsRef Websocket instance
 */
async function autoRenew(wsRef) {
  for (let i = 1; i <= MAX_RENEWAL; i++) {
    await new Promise((resolve) => setTimeout(resolve, KEY_RENEW_TIME));
    console.log(`Renewed key: ${i} times`);
    getListenKey();
  }
  unsubscribe(wsRef);
}

/**
 * Main function
 */
async function main() {
  const client = new MongoClient(dbUri);
  await client.connect();
  for (let i = 0; i < MAX_ITERATION; i++) {
    await handleStream(client);
  }
  process.exit();
}

main().catch(console.error);
