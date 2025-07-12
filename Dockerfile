FROM rust:1.88-alpine AS build
RUN apk add build-base
WORKDIR /build
COPY server server
RUN cargo install --path server --root server

FROM scratch
WORKDIR /deploy
COPY dist dist
ENV HYPER_FOLDER_DIR=./dist
COPY --from=build /build/server/bin/hyper-folder .
ENTRYPOINT ["./hyper-folder"]
