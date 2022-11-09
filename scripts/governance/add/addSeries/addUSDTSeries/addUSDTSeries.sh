#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/addUSDTSeries.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../tools/advanceTimeThreeDays.ts
$RUN $HERE/../../../../../shared/execute.ts
