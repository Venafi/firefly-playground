# Firefly with Istio demo steps 

```sh
kubectl config use-context kind-demo-cluster-base-istio 
kubectl config get-contexts
```

# Architecture

![Istio](./images/istio-service-mesh.png "Istio")

# Create a new Kubernetes cluster

Lets create a new Kubernetes cluster. You can use [KIND](https://kind.sigs.k8s.io) or [K3D](https://k3d.io/stable/).

## Step 1. Create the cluster

```sh
//k3d cluster create demo-cluster-1 --volume /Users/carl.bourne/development/Istio-firefly/config:/config
kind create cluster --name demo-cluster-2
```

## Step 2. Get cluster information

```sh
kubectl cluster-info
```

```sh
kubectl config get-contexts
```

## Step 3. Install cert-manager

```sh
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
```

## Step 4. Create a new Venafi namespace

```sh
# Create Venafi namespace
kubectl create ns venafi
```

## Step 5. Store the trustcahin/bundle for either the TLSPC built in CA or ZTPKI as a generic secret

```sh
# Store the certificate chain in K8s secrets 
# Remember to use either the ztpki_certificate_chain.cer for ZTPKI or the built-in_certificate_chain.cer cert chains depending on the Firefly configuration. 
kubectl create secret generic -n cert-manager root-cert --from-file=root-cert.pem=../crypto/ztpki_certificate_chain.cer
```

## Step 6. Store the private key for the TLSPC service account as a generic secret

```sh
# Add the private key for the Firefly service account
kubectl create secret generic venafi-credentials --namespace venafi --from-file=../crypto/svc-acct.key
```

## Step 7.  Install Firefly using the Helm chart

```sh
# Install Firefly using the helm chart

helm upgrade prod oci://registry.venafi.cloud/public/venafi-images/helm/firefly \
  --install \
  --create-namespace \
  --namespace venafi \
  --values ../firefly/internal-values.yaml \
  --version v1.5.1
```

## Step 8. Test Firefly using the cmctl command line

```sh
# Test Firefly using cmctl
cmctl create certificaterequest my-cr-test1 \
  --from-certificate-file ../crds/certificate.yaml \
  --fetch-certificate
cat my-cr-test1.crt | certigo dump
```

# Installing Istio

Now lets install Istio

```sh
# Create certificate in K8s
kubectl apply -f certificate3.yaml
```

## Step 1. Create a new namespace for Istio

```sh
kubectl create ns istio-system
```

## Step 2. Install Istio-CSR using Helm

```sh
#Install istio CSR
helm repo add jetstack https://charts.jetstack.io --force-update
helm upgrade -i -n cert-manager cert-manager-istio-csr jetstack/cert-manager-istio-csr -f ../crds/istio-csr-values.yaml
#helm repo add jetstack https://charts.jetstack.io --force-update
```

## Step 3. Install Istio

```sh
#Install Istio
istioctl install -f ../istio-config/istio-config-1.17.2.yaml -y
#istioctl upgrade
```

```sh
# Enable istio side-car injection 
#kubectl label namespace legacy istio-injection=enabled
kubectl label namespace foo istio-injection=enabled
kubectl label namespace bar istio-injection=enabled
#kubectl label namespace bookinfo istio-injection=enabled
```

# Install Some Demo Apps

```sh
#kubectl delete -f ../samples/curl.yaml -n bar
#k#ubectl delete -f ../samples/curl.yaml -n foo
#kubectl delete -f ../samples/httpbin.yaml -n bar
#kubectl delete -f ../samples/httpbin.yaml -n foo
#kubectl create ns foo
#kubectl label namespace foo istio-injection=enabled
#kubectl apply -f <(istioctl kube-inject -f ../samples/httpbin.yaml) -n foo
#kubectl apply -f <(istioctl kube-inject -f ../samples/curl.yaml) -n foo
kubectl create ns bar
#kubectl label namespace bar istio-injection=enabled
kubectl apply -f <(istioctl kube-inject -f https://raw.githubusercontent.com/istio/istio/refs/heads/master/samples/httpbin/httpbin.yaml) -n bar
kubectl apply -f <(istioctl kube-inject -f https://raw.githubusercontent.com/istio/istio/refs/heads/master/samples/curl/curl.yaml) -n bar


```

```sh
kubectl create ns legacy
kubectl apply -f ../istio/samples/curl/curl.yaml -n legacy
```

```sh
istioctl pc secret httpbin-655fd9b676-6hjl9 \
    -n foo -o json #| \
   # jq -r '.dynamicActiveSecrets[0].secret.tlsCertificate.certificateChain.inlineBytes' | \
   # base64 --decode | \
   # certigo dump
echo $?    
```

```sh
istioctl pc secret $(kubectl get pod -n bar -l app=httpbin -o jsonpath={.items..metadata.name})
```

```sh
max=1
for i in `seq 2 $max`
do
    for from in "foo" "bar" "legacy"; do for to in "foo" "bar"; do kubectl exec "$(kubectl get pod -l app=curl -n ${from} -o jsonpath={.items..metadata.name})" -c curl -n ${from} -- curl http://httpbin.${to}:8000/ip -s -o /dev/null -w "curl.${from} to httpbin.${to}: %{http_code}\n"; done; done

done
```

```sh
kubectl apply -n bar  -f - <<EOF
apiVersion: security.istio.io/v1
kind: PeerAuthentication
metadata:
  name: mtls-on
spec:
  mtls:
    mode: STRICT
EOF
```

```sh
kubectl get peerauthentication --all-namespaces
#kubectl delete peerauthentication -n istio-system mtls-on
#kubectl delete peerauthentication -n bar mtls-on
#kubectl delete peerauthentication -n foo mtls-on
#kubectl delete peerauthentication -n legacy mtls-on
```

```sh
kubectl apply -f ../istio/samples/addons/kiali.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.24/samples/addons/prometheus.yaml
kubectl apply -f https://raw.githubusercontent.com/istio/istio/release-1.24/samples/addons/grafana.yaml

#kubectl delete -f ../istio/samples/addons/kiali.yaml --ignore-not-found

```

```sh {"terminalRows":"25"}
k9s
```

```sh
kubectl create ns legacy
kubectl label namespace legacy istio-injection=enabled
kubectl apply -f ../utils/traffic-foo-bar.yaml
#kubectl create -f ./utils/traffic.yaml

```

```sh
istioctl pc secret  $(kubectl get pod -n bar -l app=httpbin -o jsonpath={.items..metadata.name}) \
    -n bar -o json | \
    jq -r '.dynamicActiveSecrets[0].secret.tlsCertificate.certificateChain.inlineBytes' | \
    base64 --decode | \
    certigo dump
```

## Delete some pods

```sh
kubectl delete pod $(kubectl get pod -n foo -l app=httpbin -o jsonpath={.items..metadata.name}) -n foo
kubectl delete pod $(kubectl get pod -n bar -l app=httpbin -o jsonpath={.items..metadata.name}) -n bar

```

```sh
kubectl get --raw /.well-known/openid-configuration | jq .issuer -r
```

```sh
kubectl rollout restart deploy cert-manager -n cert-manager  
kubectl rollout restart deploy istiod -n istio-system
kubectl rollout restart deploy cert-manager-istio-csr -n cert-manager  
kubectl rollout restart deploy firefly -n venafi
```

```sh {"terminalRows":"24"}
k9s
```