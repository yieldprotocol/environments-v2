#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"


# export CONF=$PWD/$HERE/addWBTCSeries.arbitrum.deployments
# $RUN $HERE/../../../../../shared/deploy.ts

export CONF=$PWD/$HERE/addWBTCSeries.arbitrum.config
# $RUN $HERE/../addBase.arbitrum.ts
$RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/../../../../../shared/approve.ts
# $RUN $HERE/../../../../../shared/execute.ts
