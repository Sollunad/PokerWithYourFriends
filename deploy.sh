#!/bin/sh
git reset --hard
git pull
npm run install

npm run build
rm -r /var/www/pwyf
mv frontend/dist /var/www/pwyf
service apache2 restart

pm2 restart pwyf_backend