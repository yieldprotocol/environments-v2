#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network arb_mainnet"

# Phase 1: Proposal
export CONF=$PWD/$HERE/migrateStrategies.arbitrum.config

$RUN $HERE/restoreContango.arbitrum.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
