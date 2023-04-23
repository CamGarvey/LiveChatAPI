# Chat API

This is a Chat API written in Typescript, using NestJS and Graphql, with authentication provided by Auth0.

## Dependencies

The following dependencies are required for the project:

- Node.js and npm
- Auth0 for authentication
- Docker
  - Prisma for database ORM using Postgres
  - Redis for cache

## Installation

To install and set up the project on your local machine, follow these steps:

- Run `yarn install` to install the required packages.
- Run `yarn run docker` to spin up the database and redis containers using Docker.
- Run `yarn run prisma:gen` to generate typings.
- Run `yarn run prisma:seed` to populate the database with test data.
- Run `yarn run prisma:push` to push the database schema to the database.
- Run `yarn run start:dev` to start up the development server.

## Usage

To interact with the Chat API, go to http://localhost:4000/graphql which will take you to the Apollo sandbox.

## Environment Variables

Before running the project, make sure you have set the following environment variables:

```
DOMAIN=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5438/postgres?schema=public
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=4000
CORS_ORIGIN=http://localhost:3000
AUTH0_AUDIENCE=https://dev--2cpvhzk.us.auth0.com/api/v2/
AUTH0_JWKS_URI=https://dev--2cpvhzk.us.auth0.com/.well-known/jwks.json
AUTH0_SIGNING_ALG=RS256
AUTH0_ISSUER_BASE_URL=https://dev--2cpvhzk.us.auth0.com/
AUTH0_HOOK_SECRET=
HASH_SALT=
HASH_MIN_LENGTH=11
APOLLO_KEY=
APOLLO_GRAPH_REF=graphchat@current
APOLLO_SCHEMA_REPORTING=true
```

## Important Details

You will need to upload the Auth0 server-less functions into your Auth0 account or project.
The database models are defined in the Prisma schema file. Please see the schema.prisma file for more information.
