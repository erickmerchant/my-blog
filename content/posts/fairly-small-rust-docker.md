+++
title = "Fairly small rust + docker"
date = "2023-08-20"
+++

Like me you may be sort of obsessed with getting the smallest docker image for your Rust server. This is the best way I've found. The following is an example Dockerfile, slightly simplified from the one I actually use

Use Alpine as a your base to build your binary.

``` dockerfile
# build step
FROM rust:1.71-alpine as build
RUN apk add build-base
WORKDIR deploy
```

Cache dependencies. This is not strictly related to a small build, but helps if you have to push front end changes and don't want to wait for a full rebuild.

``` dockerfile
RUN mkdir -p src
RUN echo "fn main() {}" > src/main.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --release --no-default-features --locked
```

Build the application.

``` dockerfile
COPY . .
RUN cargo build --release --no-default-features --locked
RUN mv ./target/release/your-app ./your-app
```

Clean up build artifacts.

``` dockerfile
RUN rm -rf target src Cargo.lock Cargo.toml
```

Use scratch as your base to run your binary. [https://hub.docker.com/_/scratch](https://hub.docker.com/_/scratch)

``` dockerfile
# run step
FROM scratch
WORKDIR /deploy
COPY --from=build /deploy .
ENTRYPOINT ["./your-app"]
```
