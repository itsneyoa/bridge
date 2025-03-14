FROM oven/bun:1 AS base
WORKDIR /usr/bridge

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# FROM base AS prerelease
# COPY --from=install /temp/dev/node_modules node_modules
# COPY --from=install /temp/dev/package.json .
# COPY src src

# RUN bun build --outdir=build --target=bun --sourcemap=linked --minify src/index.ts

FROM base AS release
# COPY --from=prerelease /usr/bridge/build .
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=install /temp/prod/package.json .
COPY src src

# USER bun
ENV NODE_ENV=production
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
