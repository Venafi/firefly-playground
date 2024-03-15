#!/bin/sh
if [ "$1" = "reload"  ]; then 
    echo "Requesting certificate with NGINX reload"
    $vcert enroll --platform firefly -u https://firefly.venafi.example:8281 -t $token --no-prompt --insecure --cn www.5goats.cafe  --san-dns www.5goats.cafe -z "Basic Demo" --key-file /certs/privkey.pem --cert-file /certs/fullchain.pem
    nginx -s reload
    else
  echo "Requesting certificate without NGINX reload"
  $vcert enroll --platform firefly -u https://firefly.venafi.example:8281 -t $token --no-prompt --insecure --cn www.5goats.cafe  --san-dns www.5goats.cafe -z "Basic Demo" --key-file /certs/privkey.pem --cert-file /certs/fullchain.pem
fi

