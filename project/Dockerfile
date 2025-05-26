# Dockerfile

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy full project
COPY . .

# Build React frontend
RUN npm run build

# Wechsel in Server (Express)
WORKDIR /app/server

# Start server
CMD ["node", "index.js"]
