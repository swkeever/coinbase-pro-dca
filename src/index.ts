import {purchaseCrypto} from './purchase';
import {getMarketData} from './market';
import {getOrders} from './order';

const marketData = await getMarketData();
// console.log(marketData);
const orders = await getOrders(marketData);
// console.log(orders);
const {message} = await purchaseCrypto(orders);
console.info(message);
