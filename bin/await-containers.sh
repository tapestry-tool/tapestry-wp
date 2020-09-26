# check for an configuration file
if [ -f "./bin/config.sh" ]; then
    source "./bin/config.sh"
else
    DOCKER_WP_INSTALL_DELAY=30
fi

# wait for containers
echo "Waiting $DOCKER_WP_INSTALL_DELAY seconds for containers to be ready"
sleep $DOCKER_WP_INSTALL_DELAY