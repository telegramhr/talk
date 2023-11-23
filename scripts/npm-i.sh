#!/bin/bash
set -e

cd "$(dirname "$0")"
cd ..

echo "installing git hooks"

cd scripts
sh install-git-hooks.sh
cd ..

echo "running \`npm install\` for \`config\`"
cd config
npm i --legacy-peer-deps
cd ..

echo "running \`npm install\` for \`common\`"
cd common
npm i --legacy-peer-deps
cd ..

echo "running \`npm install\` for \`client\`"
cd client
npm i --legacy-peer-deps
cd ..

echo "running \`npm install\` for \`server\`"
cd server
npm i --legacy-peer-deps
cd ..

echo "running \`npm install\` for \`docs\`"
cd docs
npm i --legacy-peer-deps
