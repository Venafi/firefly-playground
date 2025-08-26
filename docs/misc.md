# Demo Commands

### Using the cert-manager command line (cmctl) to make certificates requests from outside of a cluster. This is useful for testing.

```sh
cmctl create certificaterequest my-cr-test1 --fetch-certificate --from-certificate-file - <<EOF
  kind: Certificate
  apiVersion: cert-manager.io/v1
  metadata:
    annotations:
      #firefly.venafi.com/policy-name: istio-mtls-certs
      firefly.venafi.com/policy-name: Firefly Playground
  spec:
    secretName: example-com-tls
    commonName: srvc1.acme.com
    issuerRef:
      name: firefly
      kind: Issuer
      group: firefly.venafi.com
    privateKey:
      size: 2048
    dnsNames:
    - srvc1.acme.com
    uris:
    - spiffe://cluster.local/ns/sandbox/sa/srvc1

EOF
```

### Defining and creating certificate resources in a cluster.

```sh
kubectl apply -f - <<EOF
kind: Certificate
apiVersion: cert-manager.io/v1
metadata:
  name: 3goats12.acme.com
  namespace: venafi
  annotations:
     firefly.venafi.com/policy-name: Firefly Playground
spec:
  secretName: 3goats.acme.com
  commonName: 3goats.acme.com
  issuerRef:
    name: firefly
    kind: Issuer
    group: firefly.venafi.com
EOF
```

### CSI 

```sh

```

```sh

```