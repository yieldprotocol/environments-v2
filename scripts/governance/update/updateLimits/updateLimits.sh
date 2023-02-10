#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateLimits.mainnet.config
RUN="npx hardhat run --network tenderly"

# Action: UPDATE the limits, poropose, apporve, execute and test
$RUN $HERE/updateLimits.ts

$RUN ./shared/approve.ts
$RUN ./shared/execute.ts
$RUN $HERE/updateLimits.test.ts 

# Or :  DISPLAY the current limits
# $RUN $HERE/displayLimits.ts
