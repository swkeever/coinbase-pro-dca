import axios, {AxiosError} from 'axios';

export enum AppState {
  SUCCESS,
  INVALID_ENV,
  BUY_FAILURE,
  COIN_MARKET_CAP_API_FAILURE,
  COINBASE_API_FAILURE,
}

export interface AppResult {
  state: AppState;
  message: string;
}

export const MIN_CB_PURCHASE_AMT = 5;

export function panic({state, message}: AppResult): void {
  console.error(`☠️ ${AppState[state]}: ${message}`);
  process.exit(state);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function logError(err: unknown) {
  if (err instanceof Error) {
    console.error(err.message);
  } else if (axios.isAxiosError(err)) {
    const e = err as AxiosError;
    console.error(e.response?.data);
  } else {
    console.error('unknown error occurred');
  }
}
