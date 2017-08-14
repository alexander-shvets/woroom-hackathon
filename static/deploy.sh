#!/bin/bash

# fail fast after any error in commands
set -e

export DOCKER_HOST=tcp://127.0.0.1:32768 DOCKER_TLS_VERIFY=
docker build -t registry.ferumflex.com/ferumflex/woroom . && docker push registry.ferumflex.com/ferumflex/woroom

docker stack deploy -c docker-swarm.yml woroom --with-registry-auth --prune
