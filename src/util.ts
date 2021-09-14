export enum AppState {
  SUCCESS,
  INVALID_ENV,
  BUY_FAILURE,
}

export interface AppResult {
  state: AppState;
  message: string;
}

export function panic({state, message}: AppResult): void {
  console.error(`☠️ ${AppState[state]}: ${message}`);
  process.exit(state);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
