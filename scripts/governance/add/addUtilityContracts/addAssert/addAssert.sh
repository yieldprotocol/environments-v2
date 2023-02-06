
#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addAssert.config.ts
RUN="npx hardhat run --network mainnet"

# $RUN $HERE/../../../../../shared/deploy.ts
$RUN $HERE/addAssert.ts
# $RUN $HERE/../../../../../shared/approve.ts
# $RUN $HERE/../../../../../shared/execute.ts