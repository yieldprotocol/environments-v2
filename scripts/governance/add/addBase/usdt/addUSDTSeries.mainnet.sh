#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"


export CONF=$PWD/$HERE/addUSDTSeries.mainnet.deployments
$RUN $HERE/../../../../../shared/deploy.ts

# export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config
# $RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/../addBase.mainnet.ts
# $RUN $HERE/../../../../../shared/approve.ts
# $RUN $HERE/../../../../../shared/execute.ts
