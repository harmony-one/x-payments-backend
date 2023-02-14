import * as process from 'process';

export default () => ({
  apiKey: process.env.API_KEY || '',
  client: {
    url: process.env.CLIENT_URL || '',
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUB_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    endpointSecret: process.env.STRIPE_ENDPOINT_SECRET || '',
    priceId: process.env.STRIPE_PRICE_ID || '',
    subscriptionPriceId: process.env.STRIPE_SUBSCRIPTION_PRICE_ID || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2022-11-15',
    checkoutMinAmount: +(process.env.STRIPE_CHECKOUT_MIN_AMOUNT || 100), // 100 cents = $1
    verifyWebhookEvent: Boolean(
      process.env.STRIPE_VERIFY_WEBHOOK_EVENT || false,
    ),
  },
  web3: {
    rpcUrl: process.env.RPC_URL || 'https://api.harmony.one',
    oneCountryContractAddress:
      process.env.ONE_COUNTRY_CONTRACT_ADDRESS ||
      '0xaef596d26be185d1c25c0aadfab6ab054e7c011f',
    oneWalletPrivateKey: process.env.ONE_WALLET_PRIVATE_KEY || '',
    txConfirmTimeout: parseInt(process.env.TX_CONFIRM_TIMEOUT) || 4000,
    videoReelsContractAddress:
      process.env.VIDEO_REELS_CONTRACT_ADDRESS ||
      '0x3a6843f2AbC3CA960845108908Eae8D9d9CE058D',
    videoReelsPrivateKey: process.env.VIDEO_REELS_PRIVATE_KEY || '',
    vanityUrlContractAddress:
      process.env.VANITY_URL_CONTRACT_ADDRESS ||
      '0x88a1afC4134f385337Dd5F530D452079fC9E14CC',
    vanityUrlPrivateKey: process.env.VANITY_URL_PRIVATE_KEY || '',
  },
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 8080,
});
