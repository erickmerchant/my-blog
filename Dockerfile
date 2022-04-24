FROM rust:1.60.0-slim as builder
WORKDIR /app
COPY . .
RUN cargo install --path .
RUN cargo build --release

FROM ubuntu:latest
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /root
COPY --from=builder /app .
CMD ["./target/release/main"]
