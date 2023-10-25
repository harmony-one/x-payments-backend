import * as process from 'process';

export default () => ({
  apiKey: process.env.API_KEY || '',
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 8080,
  stripe: {
    publishableKey: process.env.STRIPE_PUB_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    endpointSecret: process.env.STRIPE_ENDPOINT_SECRET || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2022-11-15',
    checkoutMinAmount: +(process.env.STRIPE_CHECKOUT_MIN_AMOUNT || 50), // 50 cents = $0.5
    verifyWebhookEvent: Boolean(
      process.env.STRIPE_VERIFY_WEBHOOK_EVENT || false,
    ),
  },
  web3: {
    rpcUrl: process.env.RPC_URL || 'https://api.harmony.one',
    oneCountryContractAddress:
      process.env.ONE_COUNTRY_CONTRACT_ADDRESS ||
      '0x547942748Cc8840FEc23daFdD01E6457379B446D',
    txConfirmTimeout: parseInt(process.env.TX_CONFIRM_TIMEOUT || '4000'),
  },
  telegram: {
    botApiKey: process.env.TG_BOT_API_KEY || '',
    botHolderAddress: process.env.TG_BOT_HOLDER_ADDRESS || '',
  },
});
