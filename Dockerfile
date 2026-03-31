FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY . .
EXPOSE 3000
ENV CI=false
CMD ["npm","start"]