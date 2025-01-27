FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Add labels from the build arguments
ARG DOCKER_LABELS

RUN set -e; \
    for label in $(echo $DOCKER_LABELS | tr '|' '\n'); do \
        LABEL $label; \
    done
ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
