#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npx expo export -p web

cp deploy/dist.vercelignore dist/.vercelignore
cp deploy/dist.gitignore dist/.gitignore

if [ -f .vercel/project.json ]; then
  mkdir -p dist/.vercel
  cp .vercel/project.json dist/.vercel/project.json
fi

echo "dist/ ready. Deploy with: cd dist && npx vercel --prod"
