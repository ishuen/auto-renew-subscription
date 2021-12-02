import {MongoClient} from 'mongodb';
import * as config from '../config.json';
import {getListenKey, subscribeUserData, unsubscribe} from './userData.js';
const {dbUri} = config.default;
const KEY_RENEW_TIME = 1000 * 60 * 50; // 50 mins
const MAX_ITERATION = 11; // 24hr connection limit

/**
 * handleStream function
 * @param {MongoClient} client A MongoClient
 */
async function handleStream(client) {
  await getListenKey()
      .then((key) => subscribeUserData(key, client))
      .then((wsRef) => {
        (async function autoRenew() {
          for (let i = 1; i <= MAX_ITERATION; i++) {
            await new Promise((resolve) => setTimeout(resolve, KEY_RENEW_TIME));
            console.log(`Renewed key: ${i} times`);
            getListenKey();
          }
          unsubscribe(wsRef);
          handleStream(client);
        })();
      })
      .catch((e) => console.log());
}

/**
 * Main function
 */
async function main() {
  const client = new MongoClient(dbUri);
  await client.connect();
  await handleStream(client);
}

main().catch(console.error);
