FROM node
WORKDIR /dash
COPY . .
RUN yarn build

FROM nginx
COPY --from=0 /dash/dist /usr/share/nginx/html