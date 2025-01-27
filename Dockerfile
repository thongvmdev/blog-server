FROM node:22-alpine

WORKDIR /app

# Install jq (JSON processor)
RUN apk add --no-cache jq

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Define the DOCKER_METADATA argument (metadata from docker/metadata-action)
ARG DOCKER_METADATA

# Use jq to parse the JSON string properly
RUN echo "DOCKER_METADATA.labels: $(echo $DOCKER_METADATA | jq -r .labels)" && \
    echo "DOCKER_METADATA.version: $(echo $DOCKER_METADATA | jq -r .version)"

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
