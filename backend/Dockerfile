##	Uses Node.js runtime environment
##	Installs dependencies with npm
##	Copies source code into container
##	Exposes port 3001 for API traffic


# Use official Node.js image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose the port our app runs on
EXPOSE 3001

# Command to run the app
CMD ["npm", "start"]