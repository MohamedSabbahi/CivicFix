FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"] 
# Ensure your package.json has a "dev" script: "nodemon src/index.js"