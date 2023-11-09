import * as process from 'process';

export default () => ({
  apiKey: process.env.API_KEY || '',
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 3000,
  initialCreditsAmount: parseInt(process.env.INITIAL_CREDITS_AMOUNT, 10) || 100,
  stripe: {
    publishableKey: process.env.STRIPE_PUB_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    endpointSecret: process.env.STRIPE_ENDPOINT_SECRET || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2023-08-16',
    checkoutMinAmount: +(process.env.STRIPE_CHECKOUT_MIN_AMOUNT || 50), // 50 cents = $0.5
    verifyWebhookEvent: Boolean(
      process.env.STRIPE_VERIFY_WEBHOOK_EVENT || false,
    ),
  },
  web3: {
    rpcUrl: process.env.RPC_URL || 'https://api.harmony.one',
  },
  appStore: {
    key: process.env.APP_STORE_KEY || '',
    keyId: process.env.APP_STORE_KEY_ID || '',
    issuerId: process.env.APP_STORE_ISSUER_ID || '',
    bundleId: process.env.APP_STORE_APP_BUNDLE_ID || '',
    originalTxId: process.env.APP_STORE_ORIGINAL_TX_ID || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
});
