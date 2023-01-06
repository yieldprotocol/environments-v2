#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/revokeDevelopers.config
RUN="npx hardhat run --network tenderly"
TEST="npx hardhat test --network tenderly"

$RUN $HERE/revokeDevelopers.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
$TEST $HERE/revokeDevelopers.test.ts