# To build: docker build -t <docker image name> <path of the dockerfile>

# Image retrieved from https://hub.docker.com/
FROM node:14-alpine  

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# The directory being copy to /usr/src/app
COPY package.json /usr/src/app

# Bundle app source
COPY . /usr/src/app

# COPY package-lock.json /usr/src/app
RUN npm install

CMD ["node", "index.js"]

EXPOSE 4000

