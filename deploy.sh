#!/bin/bash

cd /var/www/almoxarife-web || exit 1

git pull
npm install
npm run build
pm2 restart almox-api