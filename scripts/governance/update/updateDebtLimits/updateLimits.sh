#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateLimits.arb_mainnet.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network tenderly"

# Action: UPDATE the limits, propose, apporve, execute and test
# $RUN $HERE/updateLimits.ts

$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
# $RUN $HERE/updateLimits.test.ts 

# Or :  DISPLAY the current limits
# $RUN $HERE/displayLimits.ts
