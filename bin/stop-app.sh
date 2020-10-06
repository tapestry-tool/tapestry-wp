# get the pid of the running vue application
app_proc=$(lsof -t -i:8080)

# kill the process
if [ -z "$app_proc" ]; then
    echo "Application not running! No action taken"
else
    kill "$app_proc"
fi