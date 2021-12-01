import * as config from '../config.json';
const {dbName} = config.default;

const ACCOUNT_UPDATES = 'accountUpdates';
const BALANCE_UPDATES = 'balanceUpdates';
const ORDER_UPDATES = 'orderUpdates';
const ACCOUNT_STATUS = 'accountStatus';

/**
 * Create a new accountUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} accountUpdate The account update event object
 */
export async function insertAccountUpdate(client, accountUpdate) {
  const result = await client
      .db(dbName)
      .collection(ACCOUNT_UPDATES)
      .insertOne(accountUpdate);
  console.log(result);
  return result;
}

/**
 * Create a new balanceUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} balanceUpdate The balance update event object
 */
export async function insertBalanceUpdate(client, balanceUpdate) {
  const result = await client
      .db(dbName)
      .collection(BALANCE_UPDATES)
      .insertOne(balanceUpdate);
  console.log(result);
  return result;
}

/**
 * Create a new orderUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} orderUpdate The order update event object
 */
export async function insertOrderUpdate(client, orderUpdate) {
  const result = await client
      .db(dbName)
      .collection(ORDER_UPDATES)
      .insertOne(orderUpdate);
  console.log(result);
  return result;
}

/**
 * Find an account status record
 * @param {MongoClient} client A MongoClient
 * @param {String} asset The name of the coin
 */
export async function findStatusByAsset(client, asset) {
  return await client.db(dbName).collection(ACCOUNT_STATUS).findOne({asset});
}

/**
 * Upsert an account status record
 * @param {MongoClient} client A MongoClient
 * @param {object} orderUpdate An object includes asset, amount, avg entry price
 */
export async function upsertAccountStatus(client, orderUpdate) {
  const result = await client
      .db(dbName)
      .collection(ACCOUNT_STATUS)
      .updateOne(
          {asset: orderUpdate.asset},
          {
            $set: {
              lastUpdateTime: Date.now,
              ...orderUpdate,
            },
          },
          {upsert: true},
      );
  console.log(result);
  if (result.upsertedCount <= 0 && result.modifiedCount <= 0) {
    console.log('No document upserted');
  }
}
