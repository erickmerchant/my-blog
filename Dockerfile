FROM rust:1.60.0-alpine as build
RUN apk add build-base
WORKDIR /build
COPY . .
RUN rustup target add aarch64-unknown-linux-musl
RUN cargo build --target=aarch64-unknown-linux-musl --package=main --release

FROM alpine
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY . .
COPY --from=build /build/target/aarch64-unknown-linux-musl/release/main ./main
CMD ["./main"]
