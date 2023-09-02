FROM rust:1.72-alpine as build
RUN apk add build-base
WORKDIR deploy
# cache deps
RUN mkdir -p src/bin
RUN echo "fn main() {}" > src/bin/dummy.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --bin dummy --release --no-default-features --locked
# build app
COPY . .
RUN cargo build --release --no-default-features --locked
RUN mv ./target/release/app ./app
# clean up
RUN rm -rf target src Cargo.lock Cargo.toml

FROM scratch
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./app"]
