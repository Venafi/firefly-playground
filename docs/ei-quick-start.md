---
icon: material/information-outline
tags:
  - v0.1
---

# cert-manager with CyberArk Certificate Manager (SaaS & Datacenter) QuickStart

## Overview

This quick-start is intended to to provide a single point of reference for installing and configuring CyberArk Enterprise Issuer (EI) with cert-manager.

It will include the following components:

* **Enterprise Issuer for CyberArk Certificate Manager**

   Enterprise Issuer for CyberArk Certificate Manager (formerly as Venafi Enhanced Issuer) is a cert-manager issuer that can be either cluster-wide or per namespace. This component enables your clusters to issue certificates from Venafi Control Plane.

* **Venafi Connection**

   Venafi Connection is used to configure the connection and authentication between Venafi Control Plane and your Kubernetes cluster.

* **Enterprise cert-manager**

   Enterprise cert-manager adds certificates and certificate issuers as resource types in Kubernetes clusters, and simplifies the process of obtaining, renewing and using certificates. Venafi provides Long-Term Support (LTS) releases of cert-manager to help organizations with lifecycle planning. Each LTS release is maintained for a minimum of two years.

switch to the correct Kubernetes context

```sh
kubectl config use-context kind-enhanced-issuer-clean
```

The CyberArk enterprise components for Kubernetes are made avaialble to customers via a private OCI (`registry.venafi.cloud`) repository. Access to this repository is provided via the CyberArk Certificate Manager control plane. An OCI credential can be created within the control plane UI or using the Venafi command line `venctl`.

## Step 1. - Enable access to the private CyberArk OCI registry

??? abstract "Step 1. Enable access to the private CyberArk OCI registry"

    a. Create the credential
    
    ```sh title="Command: Create an image pull credential"
    venctl iam service-accounts registry create --name "Enterprise Image Pull Secret" \  # (1)
      --scopes cert-manager-components,enterprise-venafi-issuer,enterprise-approver-policy,openshift-routes \
      --output dockerconfig \
      --output-file venafi_registry_docker_config.json \  # (2)
      --validity 365 \
      --api-key 3968e3bb-12bc-48d6-aaf6-f51c05d900b3  # (3)
    ```
    
    1. :fontawesome-solid-circle-info: This is the display name for the credential listed in the SaaS control plane under "Service accounts"
    2. :fontawesome-solid-circle-info: This is the file name that will be used to store the new credential"
    3. :fontawesome-solid-circle-info: This is API key used to authenticate with the SaaS control plane under "Account, Preferences"
    
    b. Create a new secret from the credential
    
    ```sh title="Command: Create secret for image-pull"
    kubectl create namespace venafi
    kubectl create secret docker-registry venafi-image-pull-secret --namespace venafi --from-file .dockerconfigjson=venafi_registry_docker_config.json
    ```
    
    c. Inspect the secret
    
    ```sh title="Command: Get secret"
    kubectl get secret venafi-image-pull-secret --namespace venafi \
      --output="jsonpath={.data.\.dockerconfigjson}" \
      | base64 --decode \
      | jq
    
    ```

??? abstract "Step 2. Install and configure cert-manager"

    Use the following `helm` command to install `cert-manager` from the CyberArk OCI image registry.
    
    ```sh title="Command: cert-manager install"
    helm upgrade cert-manager oci://registry.venafi.cloud/charts/cert-manager \
      --install \
      --wait \
      --create-namespace \
      --namespace venafi \
      --values cert-manager.values.yaml \  # (1)
      --version v1.18.2
    ```
    
    1. :fontawesome-solid-circle-info: Use the `cert-manager.values.yaml` provided below.
    
    Use the following YAML to provide the values to helm.
    
    ```yaml title="cert-manager.values.yaml"
    global:
      imagePullSecrets:
        - name: venafi-image-pull-secret  # (1)
    
    crds:
      enabled: true
    
    image:
      repository: private-registry.venafi.cloud/cert-manager/cert-manager-controller
    
    acmesolver:
      image:
        repository: private-registry.venafi.cloud/cert-manager/cert-manager-acmesolver
    
    webhook:
      image:
        repository: private-registry.venafi.cloud/cert-manager/cert-manager-webhook
    
    cainjector:
      image:
        repository: private-registry.venafi.cloud/cert-manager/cert-manager-cainjector
    
    startupapicheck:
      image:
        repository: private-registry.venafi.cloud/cert-manager/cert-manager-startupapicheck
    ```
    
    1. :fontawesome-solid-circle-info: This is the name of the Kubernetes secret you created in step 1 above.

??? abstract "Step 3. Install Enterprise issuer"

    Use the following `helm` command to install `enterprise issuer` from the CyberArk OCI image registry.
    
    ```sh title="Command: Enterprise Issuer install"
    helm upgrade venafi-enhanced-issuer oci://registry.venafi.cloud/charts/venafi-enhanced-issuer \
        --install \
        --wait \
        --namespace venafi \
        --values venafi-enhanced-issuer.values.yaml \ # (1)
        --version v0.16.0
    ```
    
    1. :fontawesome-solid-circle-info: Use the `venafi-enhanced-issuer.values.yaml` provided below.
    
    ```yaml title="venafi-enhanced-issuer.values.yaml"
    global:
      imagePullSecrets:
        - name: venafi-image-pull-secret  # (1)
    
    venafiConnection:
      include: true # set to `false` if Venafi Connection CRDs & RBAC are already installed
    
    venafiEnhancedIssuer:
      manager:
        image:
          repository: private-registry.venafi.cloud/venafi-issuer/venafi-enhanced-issuer
    ```
    
    2. :fontawesome-solid-circle-info: This is the name of the Kubernetes secret you created in step 1 above.

??? note

    The enterprise issuer will automatically install the `Venafi Connection" component. Venafi Connection is used to configure the connection and authentication between Venafi Control Plane and your Kubernetes cluster.
    
    Venafi Connection is a "namespaced" resource. Any service account or secret referenced by a Venafi Connection must be in the same namespace as the Venafi Connection resource or in a namespace that matches the allowReferencesFrom field, as described in cross namespace Venafi Connection references.
    
    You can add the custom resources definitions for Venafi Connections to your Kubernetes API server when you install one of the projects that use the Venafi Connection resources as configuration.

This will be used to connect to the SaaS control plane and will use the SaaS control plane credential created in step 4.

??? abstract "Step 4. Venafi Connections"

    The custom resources definitions for VenafiIssuer and VenafiClusterIssuer are added to your Kubernetes API server when you install Enterprise Issuer.
    
    Select one of the following: 
    
    
    === "Venafi SaaS Connection"
    
        VenafiClusterIssuer is a cluster-scoped resource and doesn't have a namespace. Any Venafi Connection custom resource referenced by a VenafiClusterIssuer MUST be in the venafi namespace, or which ever namespace you installed Enterprise Issuer in.
    
        ---
    
        Todo
    
    
        create a secret
    
    
        ```yaml title="create SaaS secret"
        #title="venafi-cloud-credentials secret"
        kubectl apply -f - <<EOF
        apiVersion: v1
        kind: Secret
        metadata:
          name: venafi-cloud-credentials
          namespace: venafi
        stringData:
          venafi-cloud-key: 3968e3bb-12bc-48d6-aaf6-f51c05d900b3
        EOF
        ```
        
        create a SaaS connection
        terterwtewrt
        terwterwtewrtewr
    
    
        ```yaml title="create VenafiConnection"
        #title="Create VenafiConnection"
        # Create a Venafi Connection that uses the above credential
        kubectl apply -f - <<EOF
        apiVersion: jetstack.io/v1alpha1
        kind: VenafiConnection
        metadata:
        name: venafi-saas-connection
        namespace: venafi
        spec:
        vaas:
            url: https://api.venafi.cloud
            apiKey:
            - secret:
                name: venafi-cloud-credentials
                fields: ["venafi-cloud-key"]
        EOF
        ```
    
        Inspect the connection
    
        ```sh title="Command: get venafiConnection"
         kubectl get venafiConnection -n venafi
        ```
    
        ```sh title="Output: get venafiConnection"
        NAME                     AGE
        venafi-saas-connection   5d22h
        ```
    
        Create a cluster role
    
        ```yaml title="Create ClusterRole & ClusterRoleBinding"
        # create role that allows creating sa tokens for 'sandbox'
        kubectl apply -f - <<EOF
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRole
        metadata:
          name: read-creds-secret-role-for-venafi-connection
        rules:
        - apiGroups: [""]
          resources:
          - secrets
          verbs:
          - get
          resourceNames: [ "venafi-cloud-credentials" ]
        ---
        # link the controller's service account to the 'create-tokens-for-vault-sa' role
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: read-creds-secret-role-for-venafi-connection
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: read-creds-secret-role-for-venafi-connection
        subjects:
        - kind: ServiceAccount
          name: venafi-connection
          namespace: venafi
        EOF
        ```
    
      
    === "Venafi TPP Connection"
    
        VenafiIssuer is a "namespaced" resource. Any Venafi Connection custom resource referenced by a VenafiIssuer MUST be in the same namespace as the VenafiIssuer resource or MUST be in a namespace explicitly allowed in the Venafi Connection CR definition.
    
        ---
    
        Todo
    
        get an access token with VCert
    
        ```sh title="get access token"
        vcert getcred -u "https://tpp.emea.venafidemo.com" --username carl --password Tdoxwg7HysJOACvT
        ```
    
        create a TPP secret 
    
        ```yaml title="create SaaS secret"
        #title="venafi-cloud-credentials secret"
        kubectl apply -f - <<EOF
        apiVersion: v1
        kind: Secret
        metadata:
          name: venafi-tpp-credentials
          namespace: venafi
        stringData:
          access-token: tuGwRpdwS580UvoTSOfORA==
        EOF
        ```
    
         create a TPP connection
    
        ```yaml title="create VenafiIssuer"
        kubectl apply -f - <<EOF
        apiVersion: jetstack.io/v1alpha1
        kind: VenafiConnection
        metadata:
          name: venafi-tpp-connection
          namespace: venafi
        spec:
          tpp:
            url: https://tpp.emea.venafidemo.com
            accessToken:
            - secret:
                name: venafi-tpp-credentials
                fields: ["access-token"]
        EOF
        ```
    
        Inspect the connection
    
        ```sh title="Command: get venafiConnection"
         kubectl get venafiConnection -n venafi
        ```
    
        ```sh title="Output: get venafiConnection"
        NAME                     AGE
        venafi-tpp-connection    5d23h
        ```
    
        Create a cluster role
    
        ```yaml title="Create ClusterRole & ClusterRoleBinding"
        kubectl apply -f - <<EOF
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRole
        metadata:
          name: read-creds-secret-role-for-venafi-tpp-connection
        rules:
        - apiGroups: [""]
          resources:
          - secrets
          verbs:
          - get
          resourceNames: [ "venafi-tpp-credentials" ]
        ---
        # link the controller's service account to the 'create-tokens-for-vault-sa' role
        apiVersion: rbac.authorization.k8s.io/v1
        kind: ClusterRoleBinding
        metadata:
          name: read-creds-secret-role-for-venafi-tpp-connection
        roleRef:
          apiGroup: rbac.authorization.k8s.io
          kind: ClusterRole
          name: read-creds-secret-role-for-venafi-tpp-connection
        subjects:
        - kind: ServiceAccount
          name: venafi-connection
          namespace: venafi
        EOF
        ```

??? abstract "Step 5. Creating a cluster issuers"

    Enterprise Issuer for CyberArk Certificate Manager (formally Enterprise Issuer) has two custom resources: `VenafiIssuer` and `VenafiClusterIssuer`.
    
    The custom resources definitions for VenafiIssuer and VenafiClusterIssuer are added to your Kubernetes API server when you install Enterprise Issuer.
    
    Select one of the following: 
    
    
    === "VenafiClusterIssuer"
    
        VenafiClusterIssuer is a cluster-scoped resource and doesn't have a namespace. Any Venafi Connection custom resource referenced by a VenafiClusterIssuer MUST be in the venafi namespace, or which ever namespace you installed Enterprise Issuer in.
    
        ---
    
        The example below assumes that the following Venafi Connection resource exists:
    
    
        ```yaml title="create VenafiClusterIssuer"
        kubectl apply -f - <<EOF
        apiVersion: jetstack.io/v1alpha1
        kind: VenafiClusterIssuer
        metadata:
          name: venafi-saas-cluster-issuer
        spec:
          venafiConnectionName: venafi-saas-connection
          zone: cert-manager\\demo
        EOF
        ```
      
    
    
    
    === "VenafiIssuer"
    
        VenafiIssuer is a "namespaced" resource. Any Venafi Connection custom resource referenced by a VenafiIssuer MUST be in the same namespace as the VenafiIssuer resource or MUST be in a namespace explicitly allowed in the Venafi Connection CR definition.
    
    
        ---
    
        The example below assumes that the following Venafi Connection resource exists:
    
        ```yaml title="create VenafiIssuer"
        kubectl apply -f - <<EOF
        apiVersion: jetstack.io/v1alpha1
        kind: VenafiIssuer
        metadata:
          name: ingress-certs
          namespace: application-team-1
        spec:
          venafiConnectionName: application-team-1-connection
          zone: \VED\Policy\Teams\application-team-1\ingress-certs
        EOF  
        ```

??? note

    The enterprise issuer will automatically install the `Venafi Connection" component. Venafi Connection is used to configure the connection and authentication between Venafi Control Plane and your Kubernetes cluster.

??? abstract "Step test. Configure an RBAC for cert-manager auto-approve"

    If you are using Approver Policy or Enterprise Approver Policy for CyberArk Certificate Manager, no further action is required. If not, you must let cert-manager auto-approve the certificate requests that reference the VenafiClusterIssuer and VenafiIssuer types with the following RBAC
    
    ```sh
    # Configure cert-manager approval 
    kubectl apply -f - <<EOF
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRole
    metadata:
      name: cert-manager-controller-approve:venafi-enhanced-issuer
    rules:
      - apiGroups: ["cert-manager.io"]
        resources: ["signers"]
        verbs: ["approve"]
        resourceNames: ["venafiissuers.jetstack.io/*", "venaficlusterissuers.jetstack.io/*"]
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: ClusterRoleBinding
    metadata:
      name: cert-manager-controller-approve:venafi-enhanced-issuer
    roleRef:
      apiGroup: rbac.authorization.k8s.io
      kind: ClusterRole
      name: cert-manager-controller-approve:venafi-enhanced-issuer
    subjects:
      - name: cert-manager
        namespace: venafi
        kind: ServiceAccount
    EOF
    ```
    
    Check the cluster issuer
    
    ```sh
    kubectl get Venaficlusterissuers -n venafi
    ```


??? abstract "Step 6. Creating a testing certificate resources"


    Create a new Certificate

    ```sh
    kubectl apply -f - <<EOF
    kind: Certificate
    apiVersion: cert-manager.io/v1
    metadata:
      name: venafi-tpp-test-1
      namespace: venafi
    spec:
      secretName: venafi-tpp-test-1
      commonName: srvc2.acme.com
      issuerRef:
        name: venafi-tpp-cluster-issuer
        kind: "VenafiClusterIssuer"
        group: "jetstack.io"
      privateKey:
        rotationPolicy: Always
        size: 2048
      dnsNames:
      - srvc3.acme.com
      #uris:
      #- spiffe://cluster.local/ns/sandbox/sa/srvc1
    EOF


    ```


