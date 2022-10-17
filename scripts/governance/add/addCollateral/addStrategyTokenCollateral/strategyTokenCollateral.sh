#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/strategyToken.mainnet.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../deploy/deployJoins.ts # deploy Join
$RUN $HERE/deployStrategyOracle.ts

$RUN $HERE/addStrategyToken.ts
$RUN $HERE/addStrategyToken.ts
$RUN $HERE/addStrategyToken.ts
# $RUN $HERE/strategyTokenCollateral.test.ts