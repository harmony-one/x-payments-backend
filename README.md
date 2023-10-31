## Harmony Payments Service
Payments Service allows users to pay for Harmony X features with credit card / Apple Pay / Google Pay.

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

## Production setup
### Step 1
Login into Stripe account, get values for Payments backend:

```
STRIPE_PUB_KEY
STRIPE_SECRET_KEY
STRIPE_ENDPOINT_SECRET
```

To get endpoint secret, create Stripe webhook:

Webhook url:
https://payments-api.fly.dev/stripe/webhook

Listen for events:
```
checkout.session.completed
checkout.session.expired
payment_intent.created
payment_intent.processing
payment_intent.succeeded
```

### Step 2
Login on fly.io

Install fly.io cli

```
brew install flyctl
flyctl auth login
```

### Step 3
Set secrets from the first step:
```shell
flyctl secrets set STRIPE_PUB_KEY=123
flyctl secrets set STRIPE_SECRET_KEY=123
flyctl secrets set STRIPE_ENDPOINT_SECRET=123
```

Add service account private key.
It should contain enough tokens to call rent methods.
```
flyctl secrets set ONE_WALLET_PRIVATE_KEY=0x123
```

### Step 4
Check app running (you should see Swagger API):
https://payments-api.fly.dev/api#/


### production envs
`DATABASE_URL`: db connect URI. Example: postgres://postgres:@<db_service_name>:5432

`ONE_WALLET_PRIVATE_KEY` - Private key of ONE tokens holder. This account will pay for domains purchase in exchange for USD.

`STRIPE_PUB_KEY` - "Publishable key" from Stripe developer dashboard (https://dashboard.stripe.com/test/apikeys)

`STRIPE_SECRET_KEY` - "Secret key" from Stripe developer dashboard

`STRIPE_ENDPOINT_SECRET` - secret to verify webhook event from Stripe

`STRIPE_VERIFY_WEBHOOK_EVENT=true` - enable webhook event verification

More info about verification: https://stripe.com/docs/webhooks/signatures

