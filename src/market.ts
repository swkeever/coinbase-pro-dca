import axios from 'axios';
import {AppState, logError, panic} from './util';
import {Account} from 'coinbase-pro-node';
import assert from 'assert';
import {
  blacklist,
  coinbaseClient,
  coinsOutsideCoinbase,
  dcaAmount,
} from './env';

export interface MarketData {
  tradingPair: string;
  currentBalanceUSD: number;
  desiredBalanceUSD: number;
}

type MarketDataInternal = Omit<MarketData, 'desiredBalanceUSD'> & {
  marketCap: number;
};

// gets a set like ['BTC', 'ETH', ...]
async function getCoinbaseProducts(): Promise<Set<string>> {
  try {
    const products = await coinbaseClient.product.getProducts();
    return new Set<string>(
      products
        .filter((p) => {
          return (
            p.quote_currency === 'USD' &&
            !p.trading_disabled &&
            !p.cancel_only &&
            !p.limit_only &&
            p.status === 'online' &&
            !p.post_only &&
            // @ts-ignore
            !p.fx_stablecoin &&
            !blacklist.has(p.base_currency)
          );
        })
        .map((p) => p.base_currency),
    );
  } catch (e) {
    panic({
      message: 'Failed to get Coinbase products',
      state: AppState.COINBASE_API_FAILURE,
    });
    return new Set<string>();
  }
}

async function getCoinbaseAccounts(): Promise<Map<string, Account>> {
  try {
    const accounts = await coinbaseClient.account.listAccounts();
    const map = new Map<string, Account>();
    for (const account of accounts) {
      map.set(account.currency, account);
    }
    return map;
  } catch (err) {
    logError(err);
    panic({
      message: 'Failed to get Coinbase accounts',
      state: AppState.COINBASE_API_FAILURE,
    });
    return new Map<string, Account>();
  }
}

export async function getMarketData(): Promise<MarketData[]> {
  try {
    interface Response {
      data: {
        symbol: string;
        quote: {
          USD: {
            price: number;
            market_cap: number;
          };
        };
      }[];
    }

    const [res, products, accounts] = await Promise.all([
      axios.get<Response>(`/v1/cryptocurrency/listings/latest`, {
        baseURL: process.env.COIN_MARKET_CAP_URL,
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
        },
      }),
      getCoinbaseProducts(),
      getCoinbaseAccounts(),
    ]);

    let totalMarketCapUSD = 0;
    let totalPortfolioAmountUSD = dcaAmount;

    return (
      res.data.data

        // only interested in things we can buy in USD
        // and things we can buy in Coinbase
        .filter((data) => {
          return (
            Boolean(data.quote?.USD?.market_cap) &&
            accounts.has(data.symbol) &&
            Boolean(data.quote?.USD?.price) &&
            products.has(data.symbol)
          );
        })

        // sort by market cap
        .sort((a, b) => b.quote.USD.market_cap - a.quote.USD.market_cap)

        // only get the top cryptocurrencies
        .slice(0, 10)

        // get data we care about
        .map((data): MarketDataInternal => {
          const marketCap = Math.sqrt(data.quote.USD.market_cap);
          const account = accounts.get(data.symbol);
          assert(account != null);
          const amtOutsideCoinbase = coinsOutsideCoinbase.get(data.symbol) ?? 0;
          const currentBalanceUSD =
            data.quote.USD.price *
            (Number(account.balance) + amtOutsideCoinbase);
          totalMarketCapUSD += marketCap;
          totalPortfolioAmountUSD += currentBalanceUSD;
          return {
            tradingPair: `${data.symbol}-USD`,
            marketCap,
            currentBalanceUSD,
          };
        })

        // get the percent of total market cap
        .map((data): MarketData => {
          const pctTotalMarket = data.marketCap / totalMarketCapUSD;
          return {
            tradingPair: data.tradingPair,
            currentBalanceUSD: Math.round(data.currentBalanceUSD),
            desiredBalanceUSD: Math.round(
              totalPortfolioAmountUSD * pctTotalMarket,
            ),
          };
        })

        // ignore coins that exceed the desired balance
        .filter((data) => data.currentBalanceUSD < data.desiredBalanceUSD)
    );
  } catch (err: unknown) {
    logError(err);
    panic({
      state: AppState.COIN_MARKET_CAP_API_FAILURE,
      message: 'Failed to get market data',
    });
    return [];
  }
}
