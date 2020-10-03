DEFAULT_DELAY=30

# check for an configuration file
if [ -f "./bin/config.sh" ]; then
    source "./bin/config.sh"
fi

# check for variable setting and set default if neccessary
if [ -z "$DOCKER_WP_INSTALL_DELAY" ]; then
    echo "Warning: using default wait time ($DEFAULT_DELAY seconds)"
    DOCKER_WP_INSTALL_DELAY=$DEFAULT_DELAY
fi

# wait for containers
echo "Waiting $DOCKER_WP_INSTALL_DELAY seconds for containers to be ready"
sleep $DOCKER_WP_INSTALL_DELAY