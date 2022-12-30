FROM denoland/deno:1.29.1
EXPOSE 5038

WORKDIR /sockpuppet
USER deno

COPY test.ts .

RUN deno cache test.ts

ADD . .
CMD ["run", "--allow-net", "test.ts"]
