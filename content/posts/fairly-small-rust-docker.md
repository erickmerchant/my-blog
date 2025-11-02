+++
title = "Fairly small rust + docker"
datePublished = "2023-08-20"
+++

Like me you may be obsessed with having the smallest docker image for your Rust
server. This is the best way I've found. The following is an example Dockerfile,
slightly simplified from the one I actually use. The key is to use
[https://hub.docker.com/\_/scratch](https://hub.docker.com/_/scratch) for the
final layer.

```docker
# Use Alpine as a your base to build your binary
FROM rust:1.78-alpine as build
RUN apk add build-base
WORKDIR build

# Cache dependencies
# This is not strictly related to a small build,
# but helps if you have to push front end changes
# and don't want to wait for a full rebuild.
RUN mkdir -p src/bin
RUN echo "fn main() {}" > src/bin/dummy.rs
COPY Cargo.toml Cargo.lock .
RUN cargo build --bin dummy --release --no-default-features --locked

# Build the application
COPY src src
RUN cargo build --release --no-default-features --locked

# Use scratch as your base to run your binary
FROM scratch
WORKDIR deploy
COPY public public
COPY --from=build /build/target/release/app .
ENTRYPOINT ["./app"]
```

The difference in size of the resulting image compared to one using just Alpine
can be quite significant. And this technique can be applied even if you are not
using Rust.
