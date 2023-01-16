#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addOSQTH.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../../../../../../shared/deploy.ts
# $RUN $HERE/addOSQTH.ts
# $RUN $HERE/../../../../../../shared/approve.ts
# $RUN $HERE/../../../../../../shared/execute.ts
$RUN $HERE/../../../../../../shared/test.ts
# $RUN $HERE/addRETH.test.ts