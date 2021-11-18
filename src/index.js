import {getListenKey, subscribeUserData, unsubscribe} from './userData.js';
const KEY_RENEW_TIME = 1000 * 60 * 50; // 50 mins
const MAX_ITERATION = 11; // 24hr connection limit

getListenKey()
    .then((key) => subscribeUserData(key))
    .then((wsRef) => {
      (async function autoRenew() {
        for (let i = 1; i <= MAX_ITERATION; i++) {
          await new Promise((resolve) => setTimeout(resolve, KEY_RENEW_TIME));
          console.log(`Renewed key: ${i} times`);
          getListenKey();
        }
        unsubscribe(wsRef);
      })();
    })
    .catch((e) => console.log());
