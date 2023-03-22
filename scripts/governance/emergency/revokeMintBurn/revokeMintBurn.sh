#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/revokeMintBurn.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts