#!/bin/sh
if [ "$1" = "reload"  ]; then 
    echo "Requesting certificate with NGINX reload"
    $vcert enroll --platform firefly -u https://firefly.venafi.example:8281 -t $token --insecure --cn www.5goats.cafe  --san-dns www.5goats.cafe -z "Firefly Playground" --key-file /certs/privkey.pem --cert-file /certs/fullchain.pem --no-prompt
    nginx -s reload
    else
  echo "Requesting certificate without NGINX reload"
  $vcert enroll --platform firefly -u https://firefly.venafi.example:8281 -t $token --insecure --cn www.5goats.cafe  --san-dns www.5goats.cafe -z "Firefly Playground" --key-file /certs/privkey.pem --cert-file /certs/fullchain.pem --no-prompt
fi

