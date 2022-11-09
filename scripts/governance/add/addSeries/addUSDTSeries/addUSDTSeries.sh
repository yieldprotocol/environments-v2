#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/addUSDTSeries.ts
# $RUN $HERE/../../../../../shared/approve.ts
# $RUN $HERE/../../../../../shared/execute.ts
