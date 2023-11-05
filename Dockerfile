FROM rust:1.73-alpine as build
RUN apk add build-base
WORKDIR build
# cache deps
RUN mkdir -p src content
RUN echo "fn main() {}" > src/main.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --bin app --release --no-default-features --locked
# build app
COPY src src
COPY content/site.json content/site.json
RUN cargo build --bin app --release --no-default-features --locked

FROM scratch
WORKDIR deploy
COPY public public
COPY templates templates
COPY storage storage
COPY --from=build /build/target/release/app .
ENTRYPOINT ["./app"]
