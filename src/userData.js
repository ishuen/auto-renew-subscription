import * as config from '../config.json';
import axios from 'axios';
import WebSocket from 'ws';

const {baseUrl, apiKey, wsUrl} = config.default;
const reconnectDelay = 5000;

export const getListenKey = () => {
  const promise = axios.post(`${baseUrl}/api/v3/userDataStream`, null, {
    headers: {'X-MBX-APIKEY': apiKey},
  });
  return promise.then((response) => response.data.listenKey);
};

export const userDataStream = (listenKey) => {
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

    ws.on('message', (message) => console.log(message));

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
