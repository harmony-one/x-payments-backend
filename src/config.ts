import * as process from 'process';

export default () => ({
  oneCountry: {
    clientUrl: process.env.ONE_COUNTRY_CLIENT_URL || '',
  },
  stripe: {
    priceId: process.env.STRIPE_PRICE_ID || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    endpointSecret: process.env.STRIPE_ENDPOINT_SECRET || '',
    apiVersion: process.env.STRIPE_API_VERSION || '2022-11-15',
  },
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 3001,
});
