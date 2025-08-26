```sh
git ls-files --others --ignored --exclude-standard
```

```sh
kind create cluster -n firefly-tpp
```

```sh
kubectl create namespace venafi
```

```sh
kubectl get --raw /.well-known/openid-configuration 
#kubectl get --raw /.well-known/openid-configuration | jq .issuer -r
#kubectl get --raw /openid/v1/jwks
```

```sh
kubectl create sa 3goats
```

```sh
kubectl create token 3goats | jwt decode -
```

## URL for github location for JWKS 

https://raw.githubusercontent.com/Venafi/firefly-playground/refs/heads/main/keys

### TPP Configuration

```sh
#Create the TPP API integration
{
  "id": "venctl",
  "name": "Venafi CLI",
  "vendor": "CyberArk Software Ltd.",
  "description": "CLI utility for managing Firefly configurations",
  "scope": "configuration;security:delete,manage;certificate:manage"
 }
```

```sh
#Create the TPP API integration
{
  "id": "firefly",
  "name": "Firefly",
  "vendor": "CyberArk Software Ltd.",
  "description": "Decentralized workload identity issuance governed by a control plane",
  "scope": "certificate:manage;security:manage"
 }
```

```sh
venctl configuration firefly generate --output-file "security-config.yaml"
```

### K8s config

```sh
kubectl create secret generic firefly-credentials \
  --namespace=venafi \
  --from-literal=username='carl' \
  --from-literal=password='Tdoxwg7HysJOACvT'
```

```sh
helm install prod oci://registry.venafi.cloud/public/venafi-images/helm/firefly \
    --namespace venafi \
    --values firefly.values.yaml \
    --version v1.8.1
```