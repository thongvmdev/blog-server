FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

# ARG LABELS

# LABEL $(echo $LABELS | sed 's/,/ /g')

RUN yarn install

COPY . .

RUN yarn build

ENV PORT=${PORT:-3000}

EXPOSE ${PORT}

CMD ["yarn", "start"]
