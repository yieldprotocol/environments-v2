#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/completeWitchV2.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/completeWitchV2.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
