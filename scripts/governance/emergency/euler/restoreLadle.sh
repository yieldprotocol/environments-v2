#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/restoreLadle.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../tools/restore.ts