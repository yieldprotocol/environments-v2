#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSensePT.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/addSensePT.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
$RUN $HERE/../../../../../shared/standardBorrowingTest.ts