#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.config
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy ContangoWitch
$RUN $HERE/deployContangoWitch.ts

# Phase 2: Orchestrate
$RUN $HERE/orchestrateContango-3.ts # propose
$RUN $HERE/orchestrateContango-3.ts # approve
$RUN $HERE/orchestrateContango-3.ts # execute
