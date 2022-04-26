FROM rust:1.60.0-slim as build
WORKDIR /build
COPY . .
RUN cargo build --package=main --release

FROM debian:bullseye-slim as app
RUN apt-get update
RUN apt-get install -y ca-certificates
RUN rm -rf /var/lib/apt/lists/*
ENV USER=app
RUN groupadd ${USER}
RUN useradd -g ${USER} ${USER}
WORKDIR /app
COPY . .
COPY --from=build /build/target/release/main ./main
RUN chown -R ${USER}:${USER} /app
USER ${USER}
CMD ["./main"]
