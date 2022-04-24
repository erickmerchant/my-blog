FROM rust:1.60.0-alpine
RUN apk add --no-cache musl-dev ca-certificates
WORKDIR /app
COPY . .
RUN cargo install --path .
RUN cargo build --release
CMD ["./target/release/main"]
