trap killgroup SIGINT

killgroup(){
  kill 0
}

deno -A --watch=content,public main.ts &
coolstyleserver serve ./dist &
wait
