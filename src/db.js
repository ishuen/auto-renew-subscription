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
 * @param {Console} logger
 */
export async function insertAccountUpdate(client, accountUpdate, logger) {
  const result = await client
      .db(dbName)
      .collection(ACCOUNT_UPDATES)
      .insertOne(accountUpdate);
  logger.info(result);
  return result;
}

/**
 * Create a new balanceUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} balanceUpdate The balance update event object
 * @param {Console} logger
 */
export async function insertBalanceUpdate(client, balanceUpdate, logger) {
  const result = await client
      .db(dbName)
      .collection(BALANCE_UPDATES)
      .insertOne(balanceUpdate);
  logger.info(result);
  return result;
}

/**
 * Create a new orderUpdate record
 * @param {MongoClient} client A MongoClient
 * @param {Object} orderUpdate The order update event object
 * @param {Console} logger
 */
export async function insertOrderUpdate(client, orderUpdate, logger) {
  const result = await client
      .db(dbName)
      .collection(ORDER_UPDATES)
      .insertOne(orderUpdate);
  logger.info(result);
  return result;
}

/**
 * Find an account status record
 * @param {MongoClient} client A MongoClient
 * @param {String} asset The name of the coin
 * @param {Console} logger
 */
export async function findStatusByAsset(client, asset, logger) {
  return await client.db(dbName).collection(ACCOUNT_STATUS).findOne({asset});
}

/**
 * Upsert an account status record
 * @param {MongoClient} client A MongoClient
 * @param {object} orderUpdate An object includes asset, amount, avg entry price
 * @param {Console} logger
 */
export async function upsertAccountStatus(client, orderUpdate, logger) {
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
  logger.info(result);
  if (result.upsertedCount <= 0 && result.modifiedCount <= 0) {
    logger.info('No document upserted');
  }
}
