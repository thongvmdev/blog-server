FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn install

COPY . .

RUN yarn build

# Add labels from the build arguments
ARG DOCKER_LABELS

LABEL maintainer="your-email@example.com" \
    version="1.0" \
    description="Business Blog Server"

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
