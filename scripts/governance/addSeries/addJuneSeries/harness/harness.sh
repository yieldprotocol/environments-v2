#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/harnessAddTest.mainnet.config
export BASE=$PWD/scripts/governance/base.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/harnessAddAsset.ts # Propose
$RUN $HERE/harnessAddAsset.ts # Approve
$RUN $HERE/harnessAddAsset.ts # Execute