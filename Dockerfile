FROM rust:1.88-alpine AS build
RUN apk add build-base
WORKDIR /build
RUN cargo install --git https://github.com/erickmerchant/hyper-folder.git --root .

FROM scratch
WORKDIR /deploy
COPY dist dist
ENV APP_BASE_DIR=./dist
COPY --from=build /build/bin/hyper-folder .
ENTRYPOINT ["./hyper-folder"]
