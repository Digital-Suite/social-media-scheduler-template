FROM node:18-alpine

WORKDIR /app

# Copy all source files first
COPY . .

# Install root dependencies
RUN npm install --omit=dev

# Install client dependencies and build the frontend
RUN cd client && npm install && npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
