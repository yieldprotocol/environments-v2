#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat test --network localhost"
$RUN $HERE/giver.test.ts