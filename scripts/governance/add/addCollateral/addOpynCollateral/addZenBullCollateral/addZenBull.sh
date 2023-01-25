#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/zenBull.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/../../../../../../shared/deploy.ts
# $RUN $HERE/addZenBull.ts
# $RUN $HERE/../../../../../../shared/approve.ts
# $RUN $HERE/../../../../../../shared/execute.ts
$RUN $HERE/../../../../../../shared/standardBorrowingTest.ts