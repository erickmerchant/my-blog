FROM rust:1.64-alpine as app
RUN apk add build-base
WORKDIR /app
RUN cargo init . --bin
COPY Cargo.toml Cargo.lock .
RUN cargo build --release --no-default-features
RUN rm -rf ./target/release/main ./target/release/deps/main-* ./src
ADD src src/
RUN cargo build --release --no-default-features
RUN mv ./target/release/main ./main
ADD assets assets/
ADD content content/
ADD templates templates/
RUN rm -rf target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /app
COPY --from=app /app .
ENTRYPOINT ["./main"]
