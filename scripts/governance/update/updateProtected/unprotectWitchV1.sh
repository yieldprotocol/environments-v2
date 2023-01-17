#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/unprotectWitchV1.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/unprotectWitchV1.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
