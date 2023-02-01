FROM rust:1.67-alpine as build
RUN apk add build-base
WORKDIR deploy
COPY . .
RUN rm -rf storage
RUN cargo run --bin build_db --release --no-default-features --locked
RUN cargo build --bin app --release --no-default-features --locked
RUN rm -rf app models scripts Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./app"]
