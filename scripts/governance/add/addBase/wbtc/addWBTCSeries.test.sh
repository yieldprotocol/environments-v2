#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addWBTCSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addWBTCSeries.test.ts