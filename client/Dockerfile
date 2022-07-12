FROM node:alpine
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
