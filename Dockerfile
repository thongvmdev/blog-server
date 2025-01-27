FROM node:22-alpine

WORKDIR /app

# Install jq (JSON processor)
RUN apk add --no-cache jq

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Use the DOCKER_LABELS build argument
ARG DOCKER_METADATA

# Use jq to parse the JSON and log specific properties
RUN echo "DOCKER_METADATA.labels: $(echo ${DOCKER_METADATA} | jq -r .labels)"

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
