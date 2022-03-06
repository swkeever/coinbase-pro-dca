import {AppResult, AppState, panic} from './util';
import dotenv from 'dotenv';
import {CoinbasePro} from 'coinbase-pro-node';

dotenv.config({path: `.env.${process.env.NODE_ENV}`});

const invalidArgs = [
  'PASSPHRASE',
  'API_KEY',
  'API_SECRET',
  'API_URL',
  'NODE_ENV',
  'DCA_AMOUNT',
  'COIN_MARKET_CAP_URL',
  'COIN_MARKET_CAP_API_KEY',
].filter((arg) => process.env[arg] == null);

if (invalidArgs.length > 0) {
  const result: AppResult = {
    state: AppState.INVALID_ENV,
    message: `The following args were not supplied: ${invalidArgs}`,
  };
  panic(result);
}

// blocked from buying any of these cryptocurrencies
export const blacklist = new Set<string>(
  Boolean(process.env.COIN_BLACKLIST)
    ? (process.env.COIN_BLACKLIST as string).split(',')
    : [],
);

export const coinsOutsideCoinbase = new Map<string, number>(
  process.env.COINS_OUTSIDE_CB != null
    ? (process.env.COINS_OUTSIDE_CB as string).split(',').map((coin) => {
        const [currency, amount] = coin.split(':');
        return [currency, Number(amount)];
      })
    : [],
);

export const dcaAmount = Number.parseInt(process.env.DCA_AMOUNT as string, 10);

if (dcaAmount < 5) {
  const result: AppResult = {
    state: AppState.INVALID_ENV,
    message: `DCA_AMOUNT must be greater than 5`,
  };
  panic(result);
}

export const coinbaseClient = new CoinbasePro({
  useSandbox: process.env.NODE_ENV !== 'production',
  passphrase: process.env.PASSPHRASE as string,
  apiSecret: process.env.API_SECRET as string,
  apiKey: process.env.API_KEY as string,
}).rest;
