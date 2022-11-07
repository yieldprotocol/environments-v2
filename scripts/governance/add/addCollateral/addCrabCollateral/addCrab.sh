#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addCrab.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/addCrab.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
$RUN $HERE/addCrab.test.ts
