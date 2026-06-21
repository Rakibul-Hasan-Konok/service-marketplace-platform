FROM node:20-bookworm

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma@5.22.0 generate

EXPOSE 4000

CMD ["npm", "run", "dev"]