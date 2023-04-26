#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/variableRate.arbitrum.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/addVariableRateBase.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
# $RUN $HERE/../../../../../shared/vrStandardBorrowingTest.ts
$RUN $HERE/../../../../../shared/vyTokenTest.ts