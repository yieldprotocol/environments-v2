#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/deployWitchV2.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/../../../deploy/deployWitch.ts