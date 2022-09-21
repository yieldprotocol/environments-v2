#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/scripts/governance/update/updateSolvency/updateSolvency.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../deploy/deploySolvency.ts

$RUN $HERE/updateSolvency.ts
$RUN $HERE/updateSolvency.ts
$RUN $HERE/advanceTimeThreeDays.ts
$RUN $HERE/updateSolvency.ts

# $RUN $HERE/solvencyCheck.ts
$RUN $HERE/addJoins.ts