FROM rust:1.60.0-alpine as build
RUN apk add build-base
WORKDIR /build
RUN mkdir src
RUN echo "fn main() {}" > src/main.rs
COPY Cargo.toml Cargo.toml
COPY Cargo.lock Cargo.lock
RUN cargo build --package=main --release
RUN rm -rf ./target/release/main ./target/release/deps/main-* ./src
COPY . .
RUN cargo build --package=main --release
RUN mv ./target/release/main ./main
RUN rm -rf target src Cargo.lock Cargo.toml .git .gitignore Dockerfile .dockerignore

FROM alpine
WORKDIR /app
COPY --from=build /build .
ENTRYPOINT ["./main"]
