#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"


export CONF=$PWD/$HERE/sellFYToken.mainnet.config

$RUN $HERE/sellFYToken.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
