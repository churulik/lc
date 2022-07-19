FROM node:18-alpine as build
ENV NODE_ENV production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --production
COPY . ./
RUN yarn build

FROM nginx:1.23-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/nginx/ssl/certs/dhparam.pem /etc/ssl/certs/dhparam.pem
COPY --from=build /app/nginx/ssl/certs/nginx-selfsigned.crt /etc/ssl/certs/nginx-selfsigned.crt
COPY --from=build /app/nginx/ssl/private/nginx-selfsigned.key /etc/ssl/private/nginx-selfsigned.key
COPY --from=build /app/nginx/ssl/snippets/self-signed.conf /etc/nginx/snippets/self-signed.conf
COPY --from=build /app/nginx/ssl/snippets/ssl-params.conf /etc/nginx/snippets/ssl-params.conf
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
