import * as config from '../config.json';
import axios from 'axios';
import WebSocket from 'ws';
import {
  insertAccountUpdate,
  insertBalanceUpdate,
  insertOrderUpdate,
} from './db.js';

const {baseUrl, apiKey, wsUrl} = config.default;
const reconnectDelay = 5000;

export const getListenKey = () => {
  const promise = axios.post(`${baseUrl}/api/v3/userDataStream`, null, {
    headers: {'X-MBX-APIKEY': apiKey},
  });
  return promise.then((response) => response.data.listenKey);
};

export const subscribeUserData = (listenKey, client) => {
  const wsRef = {};
  wsRef.closeInitiated = false;
  const initConnect = () => {
    const ws = new WebSocket(`${wsUrl}/ws/${listenKey}`);
    wsRef.ws = ws;
    console.log('connected');

    ws.on('ping', () => {
      console.log('Received ping from server');
      ws.pong();
    });

    ws.on('pong', () => {
      console.log('Received pong from server');
    });

    ws.on('error', (err) => {
      console.log(`Error: ${err}`);
    });

    ws.on('message', (message) => {
      console.log(message.toString());
      message = JSON.parse(message.toString());
      switch (message.e) {
        case 'outboundAccountPosition':
          insertAccountUpdate(client, message);
          break;
        case 'balanceUpdate':
          insertBalanceUpdate(client, message);
          break;
        case 'executionReport':
          insertOrderUpdate(client, message);
          // when status = FILLED -> account status update
          break;
        case 'listStatus':
          insertOrderUpdate(client, message);
          break;
      }
    });

    ws.on('close', (closeEventCode, reason) => {
      if (!wsRef.closeInitiated) {
        console.log(`Connection close due to ${closeEventCode}: ${reason}.`);
        setTimeout(() => {
          console.log('Reconnect to the server.');
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

export const unsubscribe = (wsRef) => {
  if (!wsRef || !wsRef.ws) console.log('No connection to close.');
  else {
    wsRef.closeInitiated = true;
    wsRef.ws.close();
  }
};
