#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/exec.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/checkSolvencyRaw.ts