trap killgroup SIGINT

killgroup(){
  kill 0
}

PORT=3000 RUST_LOG=tower_http=trace cargo watch -x 'r --bin dev --no-default-features' &
coolstyleserver proxy public &
wait
