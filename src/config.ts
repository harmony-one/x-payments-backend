export default () => ({
  oneCountryClientUrl: process.env.ONE_COUNTRY_CLIENT_URL || '',
  stripePriceId: process.env.STRIPE_PRICE_ID || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
});
