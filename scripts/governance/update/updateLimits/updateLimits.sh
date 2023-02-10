#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateLimits.mainnet.config
RUN="npx hardhat run --network tenderly"

# Action: UPDATE the limits
$RUN $HERE/updateLimits.ts

# Or :  DISPLAY the current limits
# $RUN $HERE/displayLimits.ts

# Or :  TEST the update
# $RUN $HERE/updateLimits.test.ts 
