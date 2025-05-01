deno run -A main.ts --cache-bust --inline-css && 
cargo test && 
cargo clippy && 
cargo +nightly fmt --check && 
fly deploy --remote-only
