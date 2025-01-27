FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

ARG DOCKER_LABELS

RUN if [ -n "$DOCKER_LABELS" ]; then \
        echo "$DOCKER_LABELS" | while IFS='=' read -r key value; do \
        printf "LABEL %s=\"%s\"\n" "$key" "$value" >> Dockerfile.generated; \
    done && cat Dockerfile.generated; \
fi

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]

