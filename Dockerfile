FROM rust:1.62-alpine as app
RUN apk add build-base
WORKDIR /app
RUN cargo init .
COPY Cargo.toml Cargo.lock .
RUN cargo build --release --no-default-features
RUN rm -rf ./target/release/main ./target/release/deps/main-* ./src
ADD src src/
ADD templates templates/
RUN cargo build --release --no-default-features
RUN mv ./target/release/main ./main
ADD content content/
ADD assets assets/
RUN rm -rf target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /app
COPY --from=app /app .
ENTRYPOINT ["./main"]
