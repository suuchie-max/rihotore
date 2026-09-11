#!/bin/bash
# ビルドして gh-pages ブランチに公開する
set -e
cd "$(dirname "$0")"
npm run build
cd dist
touch .nojekyll
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name=deploy -c user.email=deploy@local commit -qm "deploy $(date '+%Y-%m-%d %H:%M')"
git push -f -q https://github.com/suuchie-max/rihotore.git gh-pages
cd .. && rm -rf dist/.git
echo "published: https://suuchie-max.github.io/rihotore/"
