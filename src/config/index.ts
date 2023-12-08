import * as process from 'process';

const parseBoolean = (value = '1') => {
  if (['true', 'false'].includes(value)) {
    return value === 'true';
  }
  return Boolean(+value);
};

export default () => ({
  apiKey: process.env.API_KEY || '',
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 3000,
  initialCreditsAmount: parseInt(process.env.INITIAL_CREDITS_AMOUNT, 10) || 100,
  web3: {
    rpcUrl: process.env.RPC_URL || 'https://api.harmony.one',
  },
  appStore: {
    key: process.env.APP_STORE_KEY || '',
    keyId: process.env.APP_STORE_KEY_ID || '',
    issuerId: process.env.APP_STORE_ISSUER_ID || '',
    bundleId: process.env.APP_STORE_APP_BUNDLE_ID || '',
    isProduction: parseBoolean(process.env.APP_STORE_IS_PRODUCTION || '0'),
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
  },
});
