#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateTimelockDelay.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/updateTimelockDelay.test.ts # Test