FROM rust:1.69-alpine as build
RUN apk add build-base
WORKDIR deploy
COPY . .
RUN cargo build --release --no-default-features --locked
RUN ./target/release/setup
RUN mv ./target/release/serve ./serve
RUN rm -rf target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./serve"]
