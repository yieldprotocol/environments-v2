#!/bin/bash

set -eux
HERE=$(dirname $0)

export CONF=$PWD/$HERE/updateSolvency.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/../../deploy/deploySolvency.ts

$RUN $HERE/updateSolvency.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
