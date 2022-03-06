import {purchaseCrypto} from './purchase';
import {getMarketData} from './market';
import {getOrders} from './order';

const marketData = await getMarketData();
const orders = await getOrders(marketData);
const {message} = await purchaseCrypto(orders);
console.info(message);
