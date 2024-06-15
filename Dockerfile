FROM node:18-alpine as package.json

# Create app directory
# WORKDIR /app

# Install app dependencies
COPY --chown=app package*.json ./
COPY --chown=app /packages ./packages
RUN find packages \
      -type f \
      ! -name "package.json" \
      -delete && \
    find packages \
      -type d \
      -empty \
      -delete

FROM node:18-alpine as builder

COPY --from=package.json --chown=app . .

RUN npm ci

COPY --chown=app . .
RUN ls packages
RUN ls node_modules
RUN npm run build

FROM node:18-alpine

# ENV NODE_ENV production
# USER node

# Create app directory
# WORKDIR /app

# Install app dependencies
# COPY --chown=app package*.json ./

COPY --chown=app --from=builder /package.json .
COPY --chown=app --from=builder /dist ./dist
COPY --chown=app --from=builder /node_modules ./node_modules
COPY --chown=app --from=builder /dto ./dto
COPY --chown=app --from=builder /packages ./packages

EXPOSE 8080
CMD [ "node", "dist/index.js" ]