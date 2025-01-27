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

# Extract specific labels from the metadata and set them as Docker image labels
RUN echo "DOCKER_METADATA: $DOCKER_METADATA"
    # LABEL org.opencontainers.image.title="$(echo $DOCKER_METADATA | jq -r '.title')" \
    #       org.opencontainers.image.description="$(echo $DOCKER_METADATA | jq -r '.description')" \
    #       org.opencontainers.image.url="$(echo $DOCKER_METADATA | jq -r '.url')" \
    #       org.opencontainers.image.source="$(echo $DOCKER_METADATA | jq -r '.source')" \
    #       org.opencontainers.image.version="$(echo $DOCKER_METADATA | jq -r '.version')" \
    #       org.opencontainers.image.licenses="$(echo $DOCKER_METADATA | jq -r '.licenses')" \
    #       org.opencontainers.image.authors="$(echo $DOCKER_METADATA | jq -r '.authors')" \
    #       org.opencontainers.image.vendor="$(echo $DOCKER_METADATA | jq -r '.vendor')" \
    #       org.opencontainers.image.documentation="$(echo $DOCKER_METADATA | jq -r '.documentation')" \
    #       org.opencontainers.image.created="$(echo $DOCKER_METADATA | jq -r '.created')" \
    #       org.opencontainers.image.revision="$(echo $DOCKER_METADATA | jq -r '.revision')" \
    #       org.opencontainers.image.ref.name="$(echo $DOCKER_METADATA | jq -r '.ref.name')" \
    #       org.opencontainers.image.ref.branch="$(echo $DOCKER_METADATA | jq -r '.ref.branch')" \
    #       org.opencontainers.image.ref.sha="$(echo $DOCKER_METADATA | jq -r '.ref.sha')" \
    #       org.opencontainers.image.ref.tag="$(echo $DOCKER_METADATA | jq -r '.ref.tag')" \
    #       org.opencontainers.image.ref.dockerfile="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile')" \
    #       org.opencontainers.image.ref.dockerfile.path="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.path')" \
    #       org.opencontainers.image.ref.dockerfile.sha="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.sha')" \
    #       org.opencontainers.image.ref.dockerfile.url="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.url')" \
    #       org.opencontainers.image.ref.dockerfile.commit="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.commit')" \
    #       org.opencontainers.image.ref.dockerfile.commit.url="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.commit.url')" \
    #       org.opencontainers.image.ref.dockerfile.commit.sha="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile.commit.sha')" \
    #       org.opencontainers.image.ref.dockerfile.commit.date="$(echo $DOCKER_METADATA | jq -r '.ref.dockerfile

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
