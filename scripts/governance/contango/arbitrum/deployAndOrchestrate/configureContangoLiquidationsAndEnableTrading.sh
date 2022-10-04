#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.config
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy ContangoWitch
$RUN $HERE/deployContangoWitch.ts

# Phase 2: Orchestrate
$RUN $HERE/configureContangoLiquidationsAndEnableTrading.ts # propose
$RUN $HERE/configureContangoLiquidationsAndEnableTrading.ts # approve
$RUN $HERE/configureContangoLiquidationsAndEnableTrading.ts # execute
