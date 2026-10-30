FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json bun.lock ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=${VITE_API_URL}

EXPOSE 8080

CMD ["npm", "run", "dev"]
