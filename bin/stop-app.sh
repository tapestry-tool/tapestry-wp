# get processes running on the dev server port
proc=$(lsof -t -i:8080)

# kill any instances of node
while dat= read -r pid; do
    name=$(ps -p $pid -o comm=)
    if [[ "$name" == "node" ]]; then
        echo "killing $name"
        kill $pid
    else
        echo "skipping $name"
    fi
done <<< "$proc"
