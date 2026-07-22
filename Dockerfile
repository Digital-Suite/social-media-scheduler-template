FROM node:20-slim

WORKDIR /app

# Copy root package files and install server dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy client package files and install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy all remaining source files
COPY . .

# Build the frontend
RUN cd client && npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
