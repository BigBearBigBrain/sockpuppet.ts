FROM node
WORKDIR /dash
COPY dash .
ENV VITE_IN_CONTAINER=true
RUN yarn build


FROM denoland/deno:1.29.1
ENV VITE_IN_CONTAINER=true
EXPOSE 5038

WORKDIR /sockpuppet
USER deno

# COPY test.ts .

ADD . .
# RUN deno cache test.ts

COPY --from=0 /dash dash

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "test.ts"]
