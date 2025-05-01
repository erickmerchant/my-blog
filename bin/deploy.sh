deno run -A main.ts --rewrite && 
cargo test && 
cargo clippy && 
cargo +nightly fmt --check && 
fly deploy --remote-only
