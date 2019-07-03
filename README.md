# Catter, a shitty twitter clone

## Getting started

Setting up server:

``` sh
cd server
yarn
docker-compose up -d
prisma deploy
yarn dev
```

Setting up client:

``` sh
cd client
yarn
yarn start
```

## Cool things

- Graphql backend, with Apollo on the front end
- Functional style programming, making use of fun stuff like Monads and currying
- server/permisisons.ts, a cool package i don't see much about. no more checking
  auth inside resolvers
- a clean commit history
