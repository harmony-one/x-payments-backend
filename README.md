## Harmony Payments Service
Payments Service allows users to pay for 1.country web3 features with credit card / Apple Pay / Google Pay.

Supported contract method:
- rent

## Payments flow
<img width="1429" alt="HarmonyPaymentFlow" src="https://user-images.githubusercontent.com/8803471/216304320-79a5dce7-5bd2-4ddb-8653-860f76810163.png">


## Build and deploy
### Run locally
1) Copy `.env.example` to `.env`
2) Run
```shell
npm i
npm start
```
3) Open Swagger API [http://localhost:3001/api](http://localhost:3001/api)

### First deploy on fly.io
1) `flyctl auth login`

2) `flyctl launch`, attach Postgres DB: Yes

3) Set envs
```shell
flyctl secrets set ONE_WALLET_PRIVATE_KEY=0x1234
flyctl secrets set ONE_COUNTRY_CONTRACT_ADDRESS=0xabcd
```

### Deploy an update
`flyctl deploy`

## Connect Stripe
### Setup webhooks
Create endpoint on Stripe webhooks page: https://dashboard.stripe.com/test/webhooks/create

1) Add endpoint url: `https://<SERVICE_URL>/stripe/webhook`

2) Select events:
```shell
checkout.session.completed
checkout.session.expired
payment_intent.canceled
payment_intent.created
payment_intent.processing
payment_intent.succeeded
```

3) Confirm

### Set Stripe secret key
Get "Secret key" and "Publishable key" from Stripe developer page (https://dashboard.stripe.com/test/apikeys):
```shell
flyctl secrets set STRIPE_SECRET_KEY=12345
flyctl secrets set STRIPE_PUB_KEY=12345
```

## envs in production
`DATABASE_URL`: db connect URI. Example: postgres://postgres:@<db_service_name>:5432

`ONE_WALLET_PRIVATE_KEY` - Private key of ONE tokens holder. This account will pay for domains purchase in exchange for USD.

`STRIPE_PUB_KEY` - "Secret key" from Stripe developer dashboard (https://dashboard.stripe.com/test/apikeys)

`STRIPE_SECRET_KEY` - "Publishable key" from Stripe developer dashboard

`STRIPE_ENDPOINT_SECRET` - secret to verify webhook event from Stripe

`STRIPE_VERIFY_WEBHOOK_EVENT=true` - enable webhook event verification

More info about verification: https://stripe.com/docs/webhooks/signatures

