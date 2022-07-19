FROM node:18-alpine as build
ADD . /app
WORKDIR /app
RUN yarn install --production

FROM gcr.io/distroless/nodejs:18
COPY --from=build /app /app
WORKDIR /app
EXPOSE 5000
CMD ["dist/index.js"]
