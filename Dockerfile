FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Add labels from the build arguments
ARG DOCKER_LABELS

LABEL $(echo $DOCKER_LABELS | xargs)

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
