FROM node:18-alpine AS base

WORKDIR /app

COPY package.json yarn.lock ./

FROM base AS build

RUN export NODE_ENV=production
RUN yarn

COPY . .
RUN yarn run prisma:gen
RUN yarn run build

FROM base AS prod-build

RUN yarn install --production
COPY prisma prisma
RUN yarn run prisma:gen

FROM base AS prod

COPY --from=prod-build /app/node_modules ./node_modules
COPY --from=build  /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 5432 6379

CMD [  "yarn", "run", "start:migrate:prod" ]