FROM node:16-alpine3.11

WORKDIR /app

COPY . .

RUN apk update && apk add bind-tools

RUN yarn install --immutable

ENV NODE_ENV production

CMD ["node", "./index.js"]
