#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config

$RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/../../../../../tools/loadTimelock.ts
$RUN $HERE/addUSDTSeries.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
