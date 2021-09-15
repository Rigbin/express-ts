# Express-Typescript Template

TypeScript WebService/MicroService template.

created for educational purpose. [FH JOANNEUM IIT](https://www.fh-joanneum.at/iit),
by [Harald Schwab](mailto:harald.schwab2@fh-joanneum.at)

Redevelopment of the original [ts-ws-template](https://github.com/Rigbin/ts-ws-template).

## About

This is a base template to create web/micro-services with [Node.js](https://nodejs.org/)
and [Express](https://expressjs.com/), using [Typescript](https://www.typescriptlang.org/).

You can run it locally, as long as you have installed Node.js (I would recommend to
use [NVM](https://github.com/nvm-sh/nvm)), or using [Docker](#docker).

### Docker

**TODO...**

## Prerequisites

When developing locally, you need [Node.js](https://nodejs.org/), I recommend the current (
09.2021) [LTS 14.x](https://nodejs.org/dist/latest-v14.x/).

A useful tool to manage different version of Node.js would be [NVM](https://github.com/nvm-sh/nvm).

Clone the repository and install node packages using `npm`.

```console
git clone https://github.com/Rigbin/express-ts.git
cd express-ts
npm ci --silent
```

To start the local development server, run `start:dev`.

```console
npm run start:dev
```

To build the project, run `npm run build` or take a look into the [Docker](#docker) section.

## Testing

[Jest](https://jestjs.io/) is used as testing framework, you can find some example tests inside of [test](./test). With
the help of [supertest](https://www.npmjs.com/package/supertest) [End2End-Testing](./test/e2e) could be done without the
need of a separate running node-server.

Run tests locally

```console
npm test
```

Run tests in watch-mode

```console
npm run test:watch
```

Run tests with coverage (you can find the coverage report in [test/coverage](./test/coverage)).

```console
npm run test:coverage
```

## Endpoints and Router

The main reason why this template was newly written was to provide a more standardized way to create new API-Endpoints.
Therefore, the [BaseRouter](./src/app/routes/base.router.ts) class was created.

When you create a new Endpoint, simple `extend` from `BaseRouter` and implement the HTTP-methods you need.

For the following already base-methods exist.

* `GET /` => `protected async getAll`
* `POST /` => `protected async post`
* `PUT /:key` => `protected async put`
* `DELETE /:key` => `protected async delete`

With `protected async getByKey ` also a base-method for `GET /:key` exists, but you have to add a route for it on your
own, otherwise no sub-routes would be possible.

To add new endpoints, simple add them in the constructor of you child-class like
in [BaseRouter](./src/app/routes/base.router.ts) or [MainRouter](./src/app/routes/main.router.ts).

Also, checkout the `protected async format`-method or the `FormatData`-type to simply send multi-type responses.

## Planned features
* WebSocket support
* Authentication
* *(better)* Documentation


## Useful links

* [root-less Docker](https://docs.docker.com/engine/security/rootless/)
* [Docker Compose](https://docs.docker.com/compose/)
* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [Jest](https://jestjs.io/)
