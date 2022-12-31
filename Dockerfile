FROM node
WORKDIR /dash
COPY dash .
RUN yarn build


FROM denoland/deno:1.29.1
EXPOSE 5038

WORKDIR /sockpuppet
USER deno

# COPY test.ts .

ADD . .
# RUN deno cache test.ts

COPY --from=0 /dash dash

CMD ["run", "--allow-net", "--allow-read", "--allow-write", "test.ts"]
