import {getListenKey, userDataStream} from './userData.js';

getListenKey()
    .then((key) => userDataStream(key))
    .catch((e) => console.log());
