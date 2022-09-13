#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/scripts/governance/add/addCollateral/addFCashCollateral/addFCashMaturities/addFCashMaturitiesWand.mainnet.config.ts
RUN="npx hardhat run --network localhost"

$RUN $HERE/addFCashMaturitiesWand.ts