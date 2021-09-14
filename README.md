# coinbase-pro-dca

## Donate

Donations are much appreciated! 💙

- [Donate with Crypto](https://commerce.coinbase.com/checkout/6ba511ce-e8e4-40a9-a251-51ea77852c54)
- [Donate with PayPal](https://www.paypal.com/donate?hosted_button_id=KU56HE97DW9KU)

## Disclaimer

This software is offered "as is" and comes without warranty.

This software and information about this software is for entertainment
and educational purposes only. This is not investment advice.
**Use this software at your own risk.**

## Context

This software is a cron job that buys cryptocurrency using the Coinbase Pro API
to enable a dollar-cost averaging investment strategy.

For a detailed explanation on how this software is built,
check out [building a tool for dollar cost averaging (DCA) in Coinbase Pro](https://www.swkeever.com/coinbase-pro-dca).

## Environment Setup

Create the following files (ignored by Git).

- `.env.production` to run the script against your Coinbase Pro account.
- `.env.development` if you plan to develop the script against the [Sandbox environment](https://public.sandbox.pro.coinbase.com/).

Copy the template in `.env.example` to these files and visit [Coinbase Pro's documentation](https://docs.pro.coinbase.com/)
to learn how to fill in the required env variables.

Upload each environment variable as a encrypted secret in GitHub
so they can be used by the GitHub Action.

## Scripts

Install project dependencies.

```bash
npm install
```

Run the app in development mode.

```bash
npm run dev
```

The following script will run the script with your prod credentials.
Remember, this is going to attempt to buy crypto with real money. 
**Proceed with caution.**

```bash
npm run purchase
```

Enable the GitHub Action cron job. (Disabled by default when you first
clone this repo)

```bash
npm run cron:enable
```

Disable the GitHub Action cron job.

```bash
npm run cron:disable
```

Once you enable or disable the cron job, make
sure to push the change so that it will take effect.

## Personalization 

Update `src/coin.config.ts` to set your preferred crypto
allocation.

Update the cron schedule in `cron.yml` workflow.
