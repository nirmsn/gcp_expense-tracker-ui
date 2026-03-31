FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN addgroup -S app && adduser -S app -G app
COPY --chown=app:app . .
USER app
EXPOSE 3000
ENV CI=false
CMD ["npm","start"]