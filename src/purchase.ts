import {AppResult, AppState, logError, panic, sleep} from './util';
import axios from 'axios';
import {OrderSide, OrderType} from 'coinbase-pro-node';
import {OrderData} from './order';
import {coinbaseClient} from './env';

async function marketBuy(coin: OrderData) {
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
    logError(err);
    const data: AppResult = {
      state: AppState.BUY_FAILURE,
      message: `failed to place order`,
    };
    panic(data);
    return '💩';
  }
}

export async function purchaseCrypto(orders: OrderData[]): Promise<AppResult> {
  const fulfilledOrders: string[] = [];
  for (const order of orders) {
    fulfilledOrders.push(await marketBuy(order));
  }
  return {
    state: AppState.SUCCESS,
    message: fulfilledOrders.join('\n'),
  };
}
