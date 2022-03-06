import {purchaseCrypto} from './purchase';
import {getMarketData} from './market';
import {getStrategy} from './strategy';

const marketData = await getMarketData();
const strategies = await getStrategy(marketData);
const {message} = await purchaseCrypto(strategies);
console.info(message);
