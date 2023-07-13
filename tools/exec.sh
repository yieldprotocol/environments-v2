#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/exec.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/checkSolvency.ts