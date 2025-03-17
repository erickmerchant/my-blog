trap killgroup SIGINT

killgroup(){
  kill 0
}

APP_PORT=${APP_PORT:-3000} APP_REWRITE_ASSETS=${APP_REWRITE_ASSETS:-false} RUST_LOG=tower_http=trace cargo watch -x 'r --no-default-features' &
coolstyleserver proxy public &
wait
