FROM rust:1.66-alpine as build
RUN apk add build-base sqlite-dev
WORKDIR /all
ADD . ./
RUN rm -rf storage
RUN cargo build -p app --release --no-default-features
RUN cargo run --bin schema
RUN rm -rf app schema scripts Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
RUN apk add sqlite-dev
WORKDIR /all
COPY --from=build /all .
ENTRYPOINT ["./app"]
