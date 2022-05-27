FROM rust:1.61.0-alpine as build
RUN apk add build-base
WORKDIR /build
RUN mkdir src
RUN echo "fn main() {}" > src/main.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --package=main --release
RUN rm -rf ./target/release/main ./target/release/deps/main-* ./src
ADD src src/
ADD templates templates/
RUN cargo build --package=main --release
RUN mv ./target/release/main ./main
ADD content content/
ADD assets assets/
RUN rm -rf templates target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /app
COPY --from=build /build .
ENTRYPOINT ["./main"]
