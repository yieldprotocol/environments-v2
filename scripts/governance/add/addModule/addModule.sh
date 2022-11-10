#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

export CONF=$PWD/$HERE/addModule.mainnet.deployments
$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/addModule.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
