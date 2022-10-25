#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.witchLimits.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/../../shared/updateWitchParams.ts

$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
