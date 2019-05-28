#!/bin/bash

git checkout package-lock.json
git pull -p
npm install
npm run build
