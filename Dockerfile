# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
# Using npm install because yarn might not be pre-installed with serve in mind
RUN npm install

# Copy application files
COPY . .

# Expose the port
EXPOSE 3030

# Start the application using the package.json script
CMD ["npm", "start"]
