#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateLimits.mainnet.config
RUN="npx hardhat run --network tenderly"

# Action: UPDATE the limits, poropose, apporve, execute and test
$RUN $HERE/updateLimits.ts

$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
$RUN $HERE/updateLimits.test.ts 

# Or :  DISPLAY the current limits
# $RUN $HERE/displayLimits.ts
