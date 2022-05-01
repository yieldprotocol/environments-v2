#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateTimelockDelay.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/updateTimelockDelay.ts # Propose
$RUN $HERE/updateTimelockDelay.ts # Approve
$RUN $HERE/updateTimelockDelay.ts # Execute