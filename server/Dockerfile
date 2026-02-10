FROM node:22-alpine

WORKDIR /app

# Installation explicite de OpenSSL et de la librairie de compatibilité 1.1 depuis le dépôt v3.15
RUN apk update \
    && apk add --no-cache openssl \
    && apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.15/main libssl1.1
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"] 
# Ensure your package.json has a "dev" script: "nodemon src/index.js"