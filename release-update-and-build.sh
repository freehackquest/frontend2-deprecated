#!/bin/bash

git checkout package-lock.json
git pull -p
npm install
npm run build
if [ $1 -ne 0 ]; then
    echo "Build failed"
    exit
else
    echo "Build success"
    rm -rf dist_new
    cp -rf dist dist_new
fi