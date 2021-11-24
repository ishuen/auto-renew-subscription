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
async function dbtest() {
  const client = new MongoClient(dbUri);

  try {
    await client.connect();
    await listDatabases(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

/**
 * Create a new accountUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} accountUpdate The account update event object
 */
async function insertAccountUpdate(client, accountUpdate) {
  return await client
      .db(dbName)
      .collection(ACCOUNT_UPDATES)
      .insertOne(accountUpdate);
}

/**
 * Create a new balanceUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} balanceUpdate The balance update event object
 */
async function insertBalanceUpdate(client, balanceUpdate) {
  return await client
      .db(dbName)
      .collection(BALANCE_UPDATES)
      .insertOne(balanceUpdate);
}

/**
 * Create a new orderUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} orderUpdate The order update event object
 */
async function insertOrderUpdate(client, orderUpdate) {
  return await client
      .db(dbName)
      .collection(ORDER_UPDATES)
      .insertOne(orderUpdate);
}

/**
 * Find an account status record
 * @param {MongoClient} client A MongoClient
 * @param {String} asset The name of the coin
 */
async function findStatusByAsset(client, asset) {
  return await client.db(dbName).collection(ACCOUNT_STATUS).findOne({asset});
}

/**
 * Upsert an account status record
 * @param {MongoClient} client A MongoClient
 * @param {object} orderUpdate An object includes asset, amount, avg entry price
 */
async function upsertAccountStatus(client, orderUpdate) {
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

dbtest().catch(console.error);

// TODO: refactor export (the definition below is to pass the linter rule)
module.exports.insertAccountUpdate = insertAccountUpdate;
module.exports.insertBalanceUpdate = insertBalanceUpdate;
module.exports.insertOrderUpdate = insertOrderUpdate;
module.exports.findStatusByAsset = findStatusByAsset;
module.exports.upsertAccountStatus = upsertAccountStatus;
