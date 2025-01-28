FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

ARG BUILDTIME
ARG VERSION
ARG REVISION

LABEL BUILDTIME=$BUILDTIME \
      VERSION=$VERSION \
      REVISION=$REVISION

EXPOSE ${PORT}

CMD ["yarn", "start"]
