FROM rust:1.60.0-slim-buster
RUN apt-get update
RUN apt-get install -y ca-certificates
RUN rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN cargo install --path .
RUN cargo build --release
CMD ["./target/release/main"]
