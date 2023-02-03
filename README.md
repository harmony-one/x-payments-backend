## Harmony Payments Service

## Payments flow
<img width="1429" alt="HarmonyPaymentFlow" src="https://user-images.githubusercontent.com/8803471/216304320-79a5dce7-5bd2-4ddb-8653-860f76810163.png">

## Build and deploy
### Run locally
1) Create .env file and setup env variables using .env.example
2) Run app
```shell
npm i
npm start
```
### Deploy to fly.io
1) Check `fly.toml` configuration. Login to fly.io `flyctl auth login`.
2) Build docker image (M1)
```shell
docker build --platform linux/amd64 -t <username>/stripe-payments-backend:latest .
```
3) Deploy the image
```shell
flyctl deploy --local-only -i <username>/stripe-payments-backend:latest
```
4) Set secrets
```shell
flyctl secrets set DB_HOST=hostname
flyctl secrets set DB_PASSWORD=12345
flyctl secrets set ONE_WALLET_PRIVATE_KEY=abcd
flyctl secrets set VIDEO_REELS_PRIVATE_KEY=abcd
```
