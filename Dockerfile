FROM rust:1.66-alpine as build
RUN apk add build-base
WORKDIR /all
RUN cargo init . --bin
COPY Cargo.toml Cargo.lock .
ADD . ./
RUN cargo build -p app --release --no-default-features
RUN rm -rf app schema scripts Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
WORKDIR /all
COPY --from=build /all .
ENTRYPOINT ["./app"]
