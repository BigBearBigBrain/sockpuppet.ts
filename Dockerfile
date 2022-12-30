FROM denoland/deno:1.29.1
EXPOSE 5038

WORKDIR /sockpuppet
USER deno

COPY docker.ts .

RUN deno cache docker.ts

ADD . .
CMD ["run", "--allow-net", "test.ts"]
