import {MarketData} from './market';
import {Heap} from 'heap-js';
import assert from 'assert';
import {dcaAmount} from './env';
import {MIN_CB_PURCHASE_AMT} from './util';

export interface OrderData {
  tradingPair: string;
  amountToBuy: number;
}

export async function getOrders(
  marketData: MarketData[],
): Promise<OrderData[]> {
  // build a heap with coins with the biggest delta from the desired state
  const heap = Heap.heapify(marketData, (x, y) => {
    const dx = x.desiredBalanceUSD - x.currentBalanceUSD;
    const dy = y.desiredBalanceUSD - y.currentBalanceUSD;
    return dy - dx;
  });

  let amountLeft = dcaAmount;
  const cryptoToBuy = new Map<string, number>(); // coin symbol -> amount to buy

  while (amountLeft > 0 && !heap.isEmpty()) {
    let data = heap.pop();

    // make sure we have enough money to buy this coin
    while (
      amountLeft < MIN_CB_PURCHASE_AMT &&
      !heap.isEmpty() &&
      data != null &&
      !cryptoToBuy.has(data.tradingPair)
    ) {
      data = heap.pop();
    }

    if (data == null) {
      break;
    }

    if (!cryptoToBuy.has(data.tradingPair)) {
      cryptoToBuy.set(data.tradingPair, MIN_CB_PURCHASE_AMT);
      data.currentBalanceUSD += MIN_CB_PURCHASE_AMT;
      amountLeft -= MIN_CB_PURCHASE_AMT;
    } else {
      const amt = cryptoToBuy.get(data.tradingPair);
      assert(amt != null);
      data.currentBalanceUSD += 1;
      cryptoToBuy.set(data.tradingPair, amt + 1);
      amountLeft -= 1;
    }

    if (data.currentBalanceUSD < data.desiredBalanceUSD) {
      heap.push(data);
    }
  }

  const orders: OrderData[] = [];
  for (const [symbol, amount] of cryptoToBuy.entries()) {
    orders.push({
      tradingPair: symbol,
      amountToBuy: amount,
    });
  }

  return orders;
}
