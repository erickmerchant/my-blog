FROM rust:1.69-alpine as build
RUN apk add build-base
WORKDIR deploy
COPY . .
RUN cargo run --bin setup --release --no-default-features --locked
RUN cargo build --bin serve --release --no-default-features --locked
RUN mv ./target/release/serve ./serve
RUN rm -rf target src Cargo.lock Cargo.toml

FROM alpine
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./serve"]
