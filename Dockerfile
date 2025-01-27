FROM node:22-alpine

WORKDIR /app

# Install jq (JSON processor)
RUN apk add --no-cache jq

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Use the DOCKER_LABELS build argument
ARG DOCKER_LABELS

# Apply labels
RUN echo $DOCKER_LABELS | jq -r 'to_entries | .[] | "LABEL \(.key)=\(.value)"' | xargs -I {} sh -c '{}'

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
