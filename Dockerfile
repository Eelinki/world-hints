FROM node:24-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
COPY .env .env
COPY .db .db

EXPOSE 3000

CMD [ "npm", "start" ]
