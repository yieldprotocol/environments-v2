#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/restoreMarchFYToken.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../tools/advanceTimeToMaturity.ts
$RUN $HERE/../../../../tools/restore.ts