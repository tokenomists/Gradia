FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8000

ENV PORT=8000

CMD [ "node", "server.js" ]
