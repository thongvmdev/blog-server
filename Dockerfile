FROM node:22-alpine

ARG BUILDTIME
ARG VERSION
ARG REVISION

LABEL BUILDTIME=$BUILDTIME \
      VERSION=$VERSION \
      REVISION=$REVISION

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn set version 4.7.0 && yarn install

COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD ["yarn", "start"]
