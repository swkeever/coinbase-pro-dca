import {CoinbaseCurrency, coins} from './coin.config';
import {AppResult, AppState, panic, sleep} from './util';
import {coinbaseClient} from './client';
import axios from 'axios';
import {OrderSide, OrderType} from 'coinbase-pro-node';

async function marketBuy(coin: CoinbaseCurrency) {
  try {
    const order = await coinbaseClient.order.placeOrder({
      type: OrderType.MARKET,
      side: OrderSide.BUY,
      funds: coin.funds,
      product_id: coin.productId,
    });
    await sleep(1000);
    return `✅ Order(${order.id}) - Purchased ${coin.funds} of ${order.product_id}`;
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err?.response?.data.message
      : err instanceof Error
      ? err.message
      : 'unknown error occurred';

    const data: AppResult = {
      state: AppState.BUY_FAILURE,
      message,
    };
    panic(data);

    // impossible to reach here
    // this is to satisfy the typescript compiler
    return message;
  }
}

export async function purchaseCrypto(): Promise<AppResult> {
  const orders: string[] = [];
  for (const coin of coins) {
    orders.push(await marketBuy(coin));
  }
  return {
    state: AppState.SUCCESS,
    message: orders.join('\n'),
  };
}
