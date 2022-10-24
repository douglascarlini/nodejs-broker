FROM node:14-alpine

WORKDIR /usr/src/app

COPY src/package*.json ./
RUN npm install

COPY src .

EXPOSE 80
CMD [ "node", "index.js" ]