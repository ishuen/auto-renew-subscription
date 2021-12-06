import * as config from '../config.json';
import axios from 'axios';
import WebSocket from 'ws';
import {
  insertAccountUpdate,
  insertBalanceUpdate,
  insertOrderUpdate,
  findStatusByAsset,
  upsertAccountStatus,
} from './db.js';

const {baseUrl, apiKey, wsUrl} = config.default;
const reconnectDelay = 5000;
const defaultStatus = {
  amount: 0,
  averageEntryPriceBUSD: 0,
};

export const getListenKey = () => {
  const promise = axios.post(`${baseUrl}/api/v3/userDataStream`, null, {
    headers: {'X-MBX-APIKEY': apiKey},
  });
  return promise.then((response) => response.data.listenKey);
};

export const subscribeUserData = (listenKey, client, loggers) => {
  const wsRef = {};
  wsRef.closeInitiated = false;
  const appLogger = loggers.appLogger;
  const dbLogger = loggers.dbLogger;
  const initConnect = () => {
    const ws = new WebSocket(`${wsUrl}/ws/${listenKey}`);
    wsRef.ws = ws;
    appLogger.info('connected');

    ws.on('ping', () => {
      appLogger.info('Received ping from server');
      ws.pong();
    });

    ws.on('pong', () => {
      appLogger.info('Received pong from server');
    });

    ws.on('error', (err) => {
      appLogger.error(`Error: ${err}`);
    });

    ws.on('message', (message) => {
      appLogger.info(message.toString());
      message = JSON.parse(message.toString());
      switch (message.e) {
        case 'outboundAccountPosition':
          insertAccountUpdate(client, message, dbLogger);
          break;
        case 'balanceUpdate':
          insertBalanceUpdate(client, message, dbLogger);
          break;
        case 'executionReport':
          insertOrderUpdate(client, message, dbLogger);
          accountStatusUpdate(client, message, dbLogger);
          break;
        case 'listStatus':
          insertOrderUpdate(client, message, dbLogger);
          break;
      }
    });

    ws.on('close', (closeEventCode, reason) => {
      if (!wsRef.closeInitiated) {
        appLogger.info(`Connection close due to ${closeEventCode}: ${reason}.`);
        setTimeout(() => {
          appLogger.info('Reconnect to the server.');
          initConnect();
        }, reconnectDelay);
      } else {
        wsRef.closeInitiated = false;
      }
    });
  };
  initConnect();
  return wsRef;
};

export const unsubscribe = (wsRef, appLogger) => {
  if (!wsRef || !wsRef.ws) appLogger.error('No connection to close.');
  else {
    wsRef.closeInitiated = true;
    wsRef.ws.close();
    appLogger.info('disconnected');
  }
};

/**
 * Prepare account status object and update DB
 * @param {MongoClient} client A MongoClient
 * @param {object} message A message from stream
 * @param {Console} logger DB logger
 */
async function accountStatusUpdate(client, message, logger) {
  if (message.X !== 'FILLED') return; // Current order status
  const quote = 'BUSD';
  const symbol = message.s;
  if (!/BUSD$/.test(symbol)) return; // check if quote asset is BUSD
  const symbolExtraction = symbol.match(/^([0-9A-Z]+)BUSD$/);
  const base = symbolExtraction[1];
  let baseStatus = await findStatusByAsset(client, base);
  if (!baseStatus) {
    baseStatus = defaultStatus;
  }
  let quoteStatus = await findStatusByAsset(client, quote);
  if (!quoteStatus) {
    quoteStatus = defaultStatus;
  }
  const baseObject = {
    asset: base,
    lastUpdateTime: Date.now(),
  };
  const quoteObject = {
    asset: quote,
    lastUpdateTime: Date.now(),
  };
  const cost = Number(message.p) * Number(message.q);
  if (message.S == 'BUY') {
    baseObject.amount = baseStatus.amount + Number(message.q);
    baseObject.averageEntryPriceBUSD =
      (baseStatus.averageEntryPriceBUSD * baseStatus.amount + cost) /
      baseObject.amount;
    quoteObject.amount = quoteStatus.amount - cost;
  } else {
    baseObject.amount = baseStatus.amount - Number(message.q);
    quoteObject.amount = quoteStatus.amount + cost;
    quoteObject.averageEntryPriceBUSD =
      (quoteStatus.averageEntryPriceBUSD * quoteStatus.amount + cost) /
      quoteObject.amount;
  }
  upsertAccountStatus(client, baseObject, logger);
  upsertAccountStatus(client, quoteObject, logger);
}
