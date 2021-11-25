import {MongoClient} from 'mongodb';
import * as config from '../config.json';
const {dbUri, dbName} = config.default;

const ACCOUNT_UPDATES = 'accountUpdates';
const BALANCE_UPDATES = 'balanceUpdates';
const ORDER_UPDATES = 'orderUpdates';
const ACCOUNT_STATUS = 'accountStatus';

/**
 * Temp method to test db connection
 */
export async function connect() {
  const client = new MongoClient(dbUri);

  try {
    await client.connect();
  } catch (e) {
    console.error(e);
  }
  return client;
}

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
      .collection(dbName)
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

  if (result.upsertedCount <= 0) {
    console.log('No document upserted');
  }
}

// dbtest().catch(console.error);

// TODO: refactor export (the definition below is to pass the linter rule)
// module.exports.connect = connect;
// module.exports.insertAccountUpdate = insertAccountUpdate;
// module.exports.insertBalanceUpdate = insertBalanceUpdate;
// module.exports.insertOrderUpdate = insertOrderUpdate;
// module.exports.findStatusByAsset = findStatusByAsset;
// module.exports.upsertAccountStatus = upsertAccountStatus;