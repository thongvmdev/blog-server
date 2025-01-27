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
RUN echo "DOCKER_METADATA: $DOCKER_METADATA" && \
    eval $(echo $DOCKER_METADATA | jq -r '.labels | to_entries | .[] | "LABEL \(.key)=\(.value)"')

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
