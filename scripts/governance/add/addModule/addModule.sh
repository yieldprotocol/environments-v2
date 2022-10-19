#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addModule.mainnet.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../../deploy/deployHealer.ts

$RUN $HERE/addModule.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
