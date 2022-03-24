#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/harnessAddTest.mainnet.config
export BASE=$PWD/scripts/governance/base.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/harnessAddIlk.ts # Propose
$RUN $HERE/harnessAddIlk.ts # Approve
$RUN $HERE/harnessAddIlk.ts # Execute
$RUN $HERE/harnessAddIlk.ts # Check