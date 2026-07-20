FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies
RUN npm install --omit=dev

# Install client dependencies and build the frontend
RUN cd client && npm install && npm run build

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
