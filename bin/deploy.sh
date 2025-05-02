deno task frontend && 
cargo test && 
cargo clippy && 
cargo +nightly fmt --check && 
fly deploy --remote-only
