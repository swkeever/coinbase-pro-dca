import {AppResult, AppState, panic} from './util';
import dotenv from 'dotenv';

function validateEnvironment(): void {
  const invalidArgs = [
    'PASSPHRASE',
    'API_KEY',
    'API_SECRET',
    'NODE_ENV',
  ].filter((arg) => process.env[arg] == null);

  if (invalidArgs.length > 0) {
    const result: AppResult = {
      state: AppState.INVALID_ENV,
      message: `The following args were not supplied: ${invalidArgs}`,
    };
    panic(result);
  }
}

export function setupEnvironment(): void {
  dotenv.config({path: `.env.${process.env.NODE_ENV}`});
  validateEnvironment();
}
