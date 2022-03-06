import {MarketData} from './market';
import {Heap} from 'heap-js';
import assert from 'assert';
import {dcaAmount} from './env';

export interface Strategy {
  tradingPair: string;
  amountToBuy: number;
}

export async function getStrategy(
  marketData: MarketData[],
): Promise<Strategy[]> {
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
      amountLeft < 5 &&
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
      // edge case: we don't have enough money to buy this coin
      if (amountLeft < 5) {
        break;
      }
      cryptoToBuy.set(data.tradingPair, 5);
      data.currentBalanceUSD += 5;
      amountLeft -= 5;
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

  const strategies: Strategy[] = [];
  for (const [symbol, amount] of cryptoToBuy.entries()) {
    strategies.push({
      tradingPair: symbol,
      amountToBuy: amount,
    });
  }

  return strategies;
}
