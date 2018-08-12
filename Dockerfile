FROM node:8

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY src /app

EXPOSE 4000
CMD ["node", "server.js"]
