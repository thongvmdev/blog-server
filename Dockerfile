FROM node:22-alpine

# Define build arguments
ARG PORT
ARG BUILDTIME
ARG VERSION
ARG REVISION

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

LABEL BUILDTIME=$BUILDTIME \
      VERSION=$VERSION \
      REVISION=$REVISION

EXPOSE $PORT

CMD ["yarn", "start"]
