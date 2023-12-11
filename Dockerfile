# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the source code of the project to the container
COPY . .

# Open the port used by your application
EXPOSE 3000

# Create a shell script to run both build and start commands
RUN echo "#!/bin/bash" > run.sh && \
    echo "npm run build" >> run.sh && \
    echo "npm start" >> run.sh && \
    chmod +x run.sh

# Specify the shell script as the entry point for the container
ENTRYPOINT ["./run.sh"]
