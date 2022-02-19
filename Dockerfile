FROM node:lts-alpine AS base
WORKDIR /app
COPY package.json .
COPY package-lock.json .

FROM base AS dependencies
RUN apk add --no-cache git python3 make gcc g++
RUN npm set progress=false && npm config set depth 0
RUN npm install --only=production
RUN cp -R node_modules prod_node_modules
RUN npm install

FROM base AS release-build
COPY --from=dependencies /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json .
RUN npm run build

FROM base AS production
COPY --from=dependencies /app/prod_node_modules ./node_modules
COPY --from=release-build /app/dist ./dist
CMD [ "npm", "run", "start:prod" ]