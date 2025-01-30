FROM node:22-alpine

ARG PORT
ARG BUILDTIME
ARG VERSION
ARG REVISION

LABEL BUILDTIME=$BUILDTIME \
      VERSION=$VERSION \
      REVISION=$REVISION

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

EXPOSE $PORT

CMD ["yarn", "start"]
