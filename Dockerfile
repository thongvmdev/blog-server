FROM node:22-alpine

WORKDIR /app

# Install jq (JSON processor)
RUN apk add --no-cache jq

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Accept the metadata as an argument
ARG DOCKER_METADATA

# Extract labels and convert them to Dockerfile-compatible LABEL commands
RUN echo $DOCKER_METADATA | jq -r '.labels | to_entries | map("LABEL \(.key)=\(.value | @sh)") | .[]' > labels.sh

# Apply all labels to the image
RUN sh labels.sh

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
