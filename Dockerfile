FROM node:12

WORKDIR /build

COPY package*.json ./

RUN npm install

COPY . .

COPY ./docker .

ENV PORT=3000 PORT1=3001

EXPOSE 3000 3001

CMD [ "npm", "start" ]
