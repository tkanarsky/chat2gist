# Use Node.js v18 as the base image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the express.js server
CMD ["npm", "start"]