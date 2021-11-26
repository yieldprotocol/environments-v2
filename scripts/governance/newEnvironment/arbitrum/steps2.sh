#!/bin/bash

# This script needs to be run when the Timelock is funded

set -euxo pipefail
RUN="npx hardhat run --network arb_rinkeby "
HERE=$(dirname $0)

$RUN $HERE/90_initPools.ts
$RUN $HERE/91_initStrategies.ts