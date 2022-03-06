import {AppResult, AppState, panic, sleep} from './util';
import axios from 'axios';
import {OrderSide, OrderType} from 'coinbase-pro-node';
import {Strategy} from './strategy';
import {coinbaseClient} from './env';

async function marketBuy(coin: Strategy) {
  try {
    const order = await coinbaseClient.order.placeOrder({
      type: OrderType.MARKET,
      side: OrderSide.BUY,
      funds: coin.amountToBuy.toString(),
      product_id: coin.tradingPair,
    });
    await sleep(1000);
    return `✅ bought ${order.product_id}`;
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

export async function purchaseCrypto(
  strategies: Strategy[],
): Promise<AppResult> {
  const orders: string[] = [];
  for (const strategy of strategies) {
    orders.push(await marketBuy(strategy));
  }
  return {
    state: AppState.SUCCESS,
    message: orders.join('\n'),
  };
}
