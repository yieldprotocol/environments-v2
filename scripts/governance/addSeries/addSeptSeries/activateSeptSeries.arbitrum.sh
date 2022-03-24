#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.arbitrum.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts