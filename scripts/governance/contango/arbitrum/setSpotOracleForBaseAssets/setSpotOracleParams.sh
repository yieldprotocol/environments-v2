#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"
export CONF=$PWD/$HERE/contango.config

$RUN $HERE/setSpotOracleParams.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
