FROM node:22-alpine

ARG BUILDTIME
ARG VERSION
ARG REVISION

LABEL BUILDTIME=$BUILDTIME \
      VERSION=$VERSION \
      REVISION=$REVISION

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE ${PORT}

CMD ["pnpm", "start"]
