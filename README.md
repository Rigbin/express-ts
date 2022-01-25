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

1. Build docker image
  ```console
  docker build --no-cache -t "ts-service" .
  ```
2. Run docker container
  ```console
  docker container run -it -d -p 1234:1234 --name ts-service ts-service
  ```

Check log-output
```console
docker container logs -f ts-service
```

Stop container
```console
docker container stop ts-service
```

You find also a compose-file in the project for a productive service: [docker-compose.yml](docker-compose.yml). To start
the production environment, run the following command in the console

```console
docker-compose up -d
```

#### Multi-Stage

Because we need to transpile TypeScript to JavaScript before we can run the service (
without [`ts-node`](https://github.com/TypeStrong/ts-node)), we use
the [multi-stage](https://docs.docker.com/develop/develop-images/multistage-build/) functionality of Docker.

For this project, we need two stages.

```dockerfile
ARG NODE_VERSION=14-stretch
#...
```

at the beginning of the Dockerfile, we define an variable `NODE_VERSION` which will be used for the base container.

```dockerfile
#...

FROM node:${NODE_VERSION} AS builder

WORKDIR "/usr/src/app"

ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package*.json   ./
COPY tsconfig*.json  ./
COPY .eslintrc.json  ./
COPY .eslintignore   ./
COPY ./src           ./src
RUN npm ci --silent && npm run build

#...
```

In stage one, we use a full `node:` container as base. We add a name to it (`AS builder`), that we need later to
reference in stage two.

The `NODE_OPTIONS` is needed to avoid errors while build, because the memory requirements at this stage can be higher
than available by default.

We copy the needed files into the container and run `npm ci` to download needed node packages (
including `devDependencies`) and run the build.

Stage one is finished at this point. We could find the `dist` directory in this container, which we will copy later into
the actual Container.

```Dockerfile
#...
FROM node:${NODE_VERSION}-slim

WORKDIR "/app"

ENV NODE_ENV=production
ENV SERVICE_PORT=8080

COPY package*.json   ./
RUN npm ci --silent --only=${NODE_ENV}

## copy compiled files from stage 1
COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "/app/dist/server.js"]
EXPOSE ${SERVICE_PORT}
```

In stage two, we use the `node:...-slim` container to keep the container as small as possible. We set the `NODE_ENV`
environment variable to `production` and the Port, that will be used by the container.

We only copy `package*.json` files, because we only install production `dependencies`.

Now, we copy the `dist/` directory (transpiled JavaScript sources) from the first stage (`builder`) into the actual
Container and define the `CMD` to run the service.

### Docker-Dev

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

## Configuration

To set custom configurations, a `.env` file could be used. It will be initialized
in [environment](./src/config/environment.ts), you can find an [example](.env.example) in the repository.

#### Used Environment Variables

| VAR | DESCRIPTION | DEFAULT |
| --- |-------------| --- |
| `NODE_ENV` | what kind of 'environment' you are (`development`, `production`, `testing`)| `development` |
| `SERVICE_PORT` | on what port should the service listening on | `1234` |
| `CORS_ALLOWED` | pass a list of origins that are allowed by [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). Use *space* or *comma (,)* to separate multiple origins | `[]` |
| `SWAGGER_DESCRIPTION` | custom description displayed on swagger-ui, uses project description from otherwise | see [package.json](./package.json) |
| `SWAGGER_LISENCE` | Lisence name displayed on swagger-ui, uses project license otherwise | see [package.json](./package.json) |                                                                                                                                     

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
* `GET /:key` => `protected async getByKey`
* `PUT /:key` => `protected async put`
* `DELETE /:key` => `protected async delete`

To add new endpoints, simple add them in the `routes`-method of you child-class like
in [MainRouter](./src/app/routes/main.router.ts)
or [V1Router](./src/app/routes/v1/v1.router.ts).

```typescript
class SomeRouter extends BaseRouter {
  // ...
  protected async routes(_validators?: Validators): Promis<void> {
    this.route.get('/sub', this.getSub);
    this.route.post('/some', Middleware, this.postSome);
    // ...
  }

  // ...
}
```

When you add custom methods for custom routes (recommended way!), don't forget to `bind` them to `this` object in
the `bind`-method.

```typescript
class SomeRouter extends BaseRouter {
  // ...
  protected bind(): void {
    this.getSub = this.getSub.bind(this);
    this.postSome = this.postSome.bind(this);
    // ...
  }
  // ...
}
```

Also, checkout the `protected async format`-method or the `FormatData`-type to simply send multi-type responses.

## API-Documentation

Support for [OpenAPI/Swagger](https://swagger.io/specification/) added, using [express-jsdoc-swagger](https://www.npmjs.com/package/express-jsdoc-swagger).
Documentation for endpoints will be automatically created via JSDoc comments in `.router.ts` files.

Checkout Swagger-UI on endpoint [/api-docs](http://localhost:1234/api-docs).

> **TODO**: Add examples

## Planned features

* ~~WebSocket support~~
  * *TODO: extend docu, add example*
* Authentication
* *(extended)* Documentation
* *TODO: consistent error response (json)*

## Useful links

* [root-less Docker](https://docs.docker.com/engine/security/rootless/)
* [Docker Compose](https://docs.docker.com/compose/)
* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [Jest](https://jestjs.io/)
