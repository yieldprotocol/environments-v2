#!/bin/bash

set -eux
RUN="npx hardhat run --network localhost"
HERE=$(dirname $0)

$RUN $HERE/addCompositeSources.ts
$RUN $HERE/addCompositeSources.ts
$RUN $HERE/addCompositeSources.ts
