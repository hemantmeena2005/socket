import { Client, Account, Databases } from 'appwrite';

const client = new Client()
.setEndpoint('https://cloud.appwrite.io/v1')
.setProject('6692374e000d5880e85b');

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
