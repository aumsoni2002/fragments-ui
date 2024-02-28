# Stage 01: install dependencies
FROM node:20.10.0 AS dependencies

# define work directory for our app
WORKDIR /fragments-ui

# copy our package*.json dependencies
COPY package.json package-lock.json /fragments-ui/

# install app dependencies
RUN npm ci

# Install Parcel globally
RUN npm install -g parcel-bundler

# Stage 02: build our app
FROM dependencies AS build

# set build args
ARG API_URL
ARG AWS_COGNITO_POOL_ID
ARG AWS_COGNITO_CLIENT_ID
ARG AWS_COGNITO_HOSTED_UI_DOMAIN
ARG OAUTH_SIGN_IN_REDIRECT_URL
ARG OAUTH_SIGN_OUT_REDIRECT_URL

# define work directory for our app
WORKDIR /fragments-ui

# copy the generated node_modules folder from our dependencies layer
COPY --from=dependencies /fragments-ui /fragments-ui/

# copy our source code into our image
COPY ./src/ /fragments-ui/src/

# Stage 03: Runtime
FROM node:20.10.0-alpine

# set work directory
WORKDIR /fragments-ui

# copy the generated node_modules folder from our dependencies layer
#COPY --from=dependencies /fragments-ui/node_modules ./node_modules

# copy built files from the build stage (ensure "build" script exists in package.json)
COPY --from=build /fragments-ui .

# Expose port (optional, as we're hosting locally)
# EXPOSE 80

# Start the container by running the server
CMD ["npm", "start"]
