FROM node:20-slim

WORKDIR /app

# Install git for npm git dependencies and configure ssh to https rewrite
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/
# Copy root package files and install server dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy client package files and install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy all remaining source files
COPY . .

# Build the frontend
RUN cd client && npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
