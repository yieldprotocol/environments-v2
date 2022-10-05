#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/deployStethLever.ts
$RUN $HERE/stethLeverSetup.ts
$RUN $HERE/stethLeverSetup.ts
$RUN $HERE/stethLeverSetup.ts
