#!/bin/bash
set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

$RUN $HERE/mocks/deployFraxAggregatorMock.ts
$RUN $HERE/mocks/deployFraxMock.ts