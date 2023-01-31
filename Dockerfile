FROM rust:1.67-alpine as chef
RUN apk add build-base
RUN cargo install cargo-chef
WORKDIR all

FROM chef as prepare
COPY . .
RUN cargo chef prepare  --recipe-path recipe.json

FROM chef AS cook
COPY --from=prepare /all/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN rm -rf storage
RUN cargo run --bin build_db --release --locked
RUN cargo build -p app --release --no-default-features --locked
RUN rm -rf app models scripts Cargo.lock Cargo.toml
RUN mv ./target/release/app ./app
RUN rm -rf target

FROM alpine
WORKDIR /all
COPY --from=cook /all .
ENTRYPOINT ["./app"]
