import {MongoClient} from 'mongodb';
import * as config from '../config.json';
const {dbUri} = config.default;

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

dbtest().catch(console.error);
