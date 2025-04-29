deno run -A main.ts && cargo test && cargo clippy && cargo +nightly fmt --check && fly deploy --remote-only
