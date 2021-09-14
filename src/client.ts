import {CoinbasePro} from 'coinbase-pro-node';
import {setupEnvironment} from './env';

setupEnvironment();

export const coinbaseClient = new CoinbasePro({
  useSandbox: process.env.NODE_ENV !== 'production',
  passphrase: process.env.PASSPHRASE as string,
  apiSecret: process.env.API_SECRET as string,
  apiKey: process.env.API_KEY as string,
}).rest;
