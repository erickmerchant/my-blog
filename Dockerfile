FROM rust:1.67-alpine as build
RUN apk add build-base
WORKDIR /all
ADD . ./
RUN rm -rf storage
RUN cargo run --bin build_db --locked
RUN cargo build -p app --release --no-default-features --locked
RUN rm -rf app models scripts Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
WORKDIR /all
COPY --from=build /all .
ENTRYPOINT ["./app"]
