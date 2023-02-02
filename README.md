## Harmony Payments Service

## Payments flow


## Build and deploy
### fly.io
1) Check fly.toml, login to fly.io: `flyctl auth`
2) Build docker image (M1)
```shell
docker build --platform linux/amd64 -t <username>/stripe-payments-backend:latest .
```
3) Deploy to fly.io
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
