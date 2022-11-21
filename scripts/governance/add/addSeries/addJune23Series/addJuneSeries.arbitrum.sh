#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addJuneSeries.arbitrum.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../../../../../tools/joinLoan.ts
# $RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/../../../../../tools/advanceTimeToMaturity.ts

# Phase 1: Deploy Contracts
export CONF=$PWD/$HERE/addJuneSeries.arbitrum.deployments
$RUN $HERE/../../../../../shared/deploy.ts

# Phase 2: Orchestrate
# export CONF=$PWD/$HERE/addJuneSeries.arbitrum.config
# $RUN $HERE/activateJuneSeries.ts
# $RUN $HERE/../../../../../shared/approve.ts
# $RUN $HERE/../../../../../shared/execute.ts

# $RUN $HERE/deployFYTokens.ts