FROM rust:1.73-alpine as build
RUN apk add build-base
WORKDIR build
# cache deps
RUN mkdir -p app/src
RUN mkdir -p setup/src
RUN echo "fn main() {}" > app/src/main.rs
RUN echo "fn main() {}" > setup/src/main.rs
COPY Cargo.toml Cargo.lock .
COPY app/Cargo.toml app/Cargo.toml
COPY setup/Cargo.toml setup/Cargo.toml
RUN cargo build --bin app --release --no-default-features --locked
RUN cargo build --bin setup --release --no-default-features --locked
# build app
COPY app app
COPY setup setup
COPY content content
RUN cargo run --bin setup --release --no-default-features --locked
RUN cargo build --bin app --release --no-default-features --locked

FROM scratch
WORKDIR deploy
COPY public public
COPY templates templates
COPY --from=build /build/storage storage
COPY --from=build /build/target/release/app .
ENTRYPOINT ["./app"]
