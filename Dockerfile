FROM rust:1.72-alpine as build
RUN apk add build-base
WORKDIR deploy
# cache deps
RUN mkdir -p src
RUN echo "fn main() {}" > src/main.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --bin app --release --no-default-features --locked
# build app
COPY . .
RUN cargo build --bin serve --release --no-default-features --locked
RUN mv ./target/release/serve ./serve
# clean up
RUN rm -rf target src Cargo.lock Cargo.toml

FROM scratch
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./serve"]
