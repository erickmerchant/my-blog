FROM rust:1.62.0-alpine as build
RUN apk add build-base
WORKDIR /build
COPY ./ ./
RUN cargo build --package=main --release
RUN mv ./target/release/main ./main
RUN rm -rf templates target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /app
COPY --from=build /build .
ENTRYPOINT ["./main"]
