#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"


export CONF=$PWD/$HERE/addUSDTSeries.arbitrum.deployments
$RUN $HERE/../../../../../shared/deploy.ts

export CONF=$PWD/$HERE/addUSDTSeries.arbitrum.config
$RUN $HERE/../../../../../tools/loadTimelock.ts
$RUN $HERE/addUSDTSeries.arbitrum.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
