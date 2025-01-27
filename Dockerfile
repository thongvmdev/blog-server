FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

ARG DOCKER_LABELS
RUN echo "DOCKER_LABELS passed to the build: $DOCKER_LABELS"

ARG DOCKER_METADATA
RUN echo "DOCKER_METADATA passed to the build: $DOCKER_METADATA"

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]

