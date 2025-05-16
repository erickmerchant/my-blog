FROM rust:1.87-alpine AS build
RUN apk add build-base
WORKDIR /build
# cache deps
RUN mkdir -p src/bin
RUN echo "fn main() {}" > src/bin/dummy.rs
COPY Cargo.toml Cargo.lock ./
RUN cargo build --bin dummy --release --no-default-features --locked
# build app
COPY src src
RUN cargo build --release --no-default-features --locked

FROM scratch
WORKDIR /deploy
COPY dist dist
COPY --from=build /build/target/release/app .
ENTRYPOINT ["./app"]
