#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateDust.config
RUN="npx hardhat run --network tenderly"
# RUN="npx hardhat run --network localhost"

$RUN $HERE/updateDust.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
$RUN $HERE/updateDust.test.ts