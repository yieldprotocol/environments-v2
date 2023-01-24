#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addRETH.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../../../shared/deploy.ts
$RUN $HERE/addRETH.ts
$RUN $HERE/../../../../../../shared/approve.ts
$RUN $HERE/../../../../../../shared/execute.ts
$RUN $HERE/../../../../../../shared/standardBorrowingTest.ts