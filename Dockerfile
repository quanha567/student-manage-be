FROM node:18-alpine
# Installing libvips-dev for sharp Compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
WORKDIR /opt/
COPY ./package.json  ./
ENV PATH /opt/node_modules/.bin:$PATH
RUN yarn add -D pg
RUN yarn config set network-timeout 600000 -g && yarn install --frozen-lockfile
RUN yarn cache clean
WORKDIR /opt/app
COPY . .
RUN yarn build
# RUN yarn add pg --save
EXPOSE 1337
CMD ["yarn", "start"]
