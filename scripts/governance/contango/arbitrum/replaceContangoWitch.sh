#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.config
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy ContangoWitch
$RUN $HERE/deployContangoWitch.ts

# Phase 2: Orchestrate
$RUN $HERE/replaceContangoWitch.ts # propose
$RUN $HERE/replaceContangoWitch.ts # approve
$RUN $HERE/replaceContangoWitch.ts # execute
