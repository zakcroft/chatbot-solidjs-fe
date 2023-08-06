FROM node:18.16.1-alpine3.17

WORKDIR /app

EXPOSE 3000

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --silent

COPY . ./

CMD ["pnpm", "start"]