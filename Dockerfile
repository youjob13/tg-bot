FROM node:18-alpine as builder

WORKDIR /app

COPY --chown=app . .

RUN npm ci
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --chown=app --from=builder /app/package.json .
COPY --chown=app --from=builder /app/dist ./dist
COPY --chown=app --from=builder /app/node_modules ./node_modules
COPY --chown=app --from=builder /app/dto ./dto
COPY --chown=app --from=builder /app/packages ./packages
COPY --chown=app --from=builder /app/typing ./typing
COPY --chown=app --from=builder /app/.env .

USER node
EXPOSE 8080
CMD [ "npm", "start" ]