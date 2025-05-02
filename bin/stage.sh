trap killgroup SIGINT

killgroup(){
  docker rm -f my-blog;
  kill 0;
}

deno task frontend &&
cargo test && 
cargo clippy && 
cargo +nightly fmt --check && 
docker build . -t my-blog &&
docker run -p 3000:8080 --name my-blog my-blog &&
docker wait my-blog &
wait
