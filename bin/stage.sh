trap killgroup SIGINT

killgroup(){
  docker rm -f my-blog;
  kill 0;
}

deno run -A main.ts --cache-bust --inline-css &&
docker build . -t my-blog &&
docker run -p 3000:8080 --name my-blog my-blog &&
docker wait my-blog &
wait
