import * as config from '../config.json';
import axios from 'axios';

const {baseUrl, apiKey} = config.default;
export const getListenKey = () => {
  axios
      .post(`${baseUrl}/api/v3/userDataStream`, null, {
        headers: {'X-MBX-APIKEY': apiKey},
      })
      .then(function(response) {
        return response.data.listenKey;
      })
      .catch(function(error) {
        console.log(error);
      });
};
