#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy Contracts
# export CONF=$PWD/$HERE/rollSep23Series.mainnet.deployments
# $RUN $HERE/../../../../shared/deploy.ts

# Phase 2: Proposal
export CONF=$PWD/$HERE/rollSep23Series.mainnet.config
# $RUN $HERE/../../../../tools/poolRollBalances.ts
# $RUN $HERE/../../../../tools/joinLoan.ts

# $RUN $HERE/../../../../tools/advanceTimeToMaturity.ts
# $RUN $HERE/../rollSeries.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
