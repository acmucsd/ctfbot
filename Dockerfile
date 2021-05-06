FROM node:alpine AS base
WORKDIR /app
COPY package.json .
COPY package-lock.json .

FROM base AS dependencies
RUN apk add --no-cache python2 make gcc g++
RUN npm set progress=false && npm config set depth 0
RUN npm install
RUN cp -R node_modules build_node_modules
RUN npm install --only production

FROM base AS release-build
COPY --from=dependencies /app/build_node_modules ./node_modules
COPY src ./src
COPY tsconfig.json .
RUN npm run build

FROM base AS production_env
RUN npm install -g pm2

FROM production_env AS production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=release-build /app/dist ./dist
CMD [ "pm2-runtime", "npm", "--", "start:prod" ]