FROM rust:1.68-alpine as build
RUN apk add build-base
WORKDIR deploy
COPY . .
RUN rm -rf storage
RUN cargo run --bin setup --release --no-default-features --locked
RUN cargo build --bin app --release --no-default-features --locked
RUN rm -rf src Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./app"]
