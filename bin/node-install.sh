npm -v > /dev/null
if [ $? != 0 ]; then
    "Could not find Node installation. Please install and try again!"
    exit 1
else
    cd templates/vue && npm i
fi