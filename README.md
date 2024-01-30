# Overview 

This quick-start is intended to showcase Venafi's Firefly ephemeral CA in the shortest possible time. Assuming the following prerequisites, it should take less than 60 seconds to deploy a fully functioning Firefly instance in a local Docker environment. 

## Prerequisites 

You will require the following to proceed. 

*  Venafi Cloud account for Firefly - you can signup for a free 30 day trial [here](https://venafi.com/try-venafi/firefly/)
* An API key for your Venafi Cloud account. This can be obtained as follows: 
  1. Log in to TLS Protect Cloud.
  2. In the menu bar, click your **avatar** in the top-right corner, and then click **Preferences**.
  3. On the **API Keys** tab, click ![copy button](https://docs.venafi.cloud/api/img/ico-copy-paste.png) to generate and copy your API key.
* Access to a fairly recent Docker runtime environment 

## Audience

The intended audience for this quick-start is: 

* New or existing Venafi customers wanting to quickly see Firefly working within their own environments.
* InfoSec teams wanting to learn more about service that they can provide to cloud native developers, SRE's and platform engineering teams.
* Developers, SRE's and platform engineering teams wanting to learn more about the services that Info Sec teams should be providing 
* Internal Venafi staff wanting to demonstrate Firefly to partners and customers.

## Get Started

The quick-start demo runs entirely in Docker and consists of three container images that a pulled from the public Docker repositories. 

* 3goats/elevate - This a utility application that automates all of the required Venafi SaaS (control plane tasks) that would ordinarily be performed by an InfoSec team. Whilst these tasks can be performed manually, the utility helps by fully automating the configuration, thus new users get to see Firefly working much quicker.
* tr1ck3r/jwt-this - **jwt-this** (pronounced "jot this") is a command line utility I created to simplify demonstration, evaluation, and simple testing with Venafi Firefly. When run, it generates a new signing key pair, uses it to sign and output a new JSON Web Token (JWT) containing specified *Firefly*-related claims, and starts a basic HTTP server (listening on port 8000 by default) where the signing public key is published via a JSON Web Key Set (JWKS) so it can be used by *Firefly* to verify the signature of the JWT.

* public.ecr.aws/venafi-images/firefly - This is the main Firefly instance that will be initialised for the demonstration

The demonstration uses a single `docker-compose`file (docker-compose.yaml) that automates the three containers as follows:

> [!IMPORTANT]  
> You must edit the `docker-compose.yaml` file and add your Venafi cloud API key at the placeholder. This is the only thing you need to change.

```yaml
services:
  elevate:
    image: "3goats/elevate"
    command: --api-key <--Replace this with Venafi cloud API key!--> -f /config/general-config.yaml --force -p demo -t demo
    volumes:
      - ./config:/config
    profiles:
      - control-plane
  jwt-this:
    image: "tr1ck3r/jwt-this:latest"
    ports:
      - "8001:8000"
    command: --config-name "Demo Config" --policy-names "Demo Policy"
    profiles:
      - demo
  firefly:
    #depends_on:
    #    elevate: 
    #      condition: service_completed_successfully
    image: "public.ecr.aws/venafi-images/firefly"
    ports:
      #- "8082:8082"
      #- "8123:8123"
      - "8289:8281"
    command: run -c /etc/firefly/config.yaml
    volumes:
      - ./config/config.yaml:/etc/firefly/config.yaml
      - ./config:/etc/firefly:ro
      - ./trust:/etc/firefly/trust:rw
    cap_add:
      - IPC_LOCK
    environment:
      - ACCEPT_TERMS=Y
    links:
      - "jwt-this:jwt-this.example"
    profiles:
      - demo

```

You can now run a docker command to configure the Venafi Cloud control plane as follows:

``` bash
docker compose --profile control-plane up
```

You should see the following output. You should also the following new files in the  `./config` directory. 

*  **config.yaml** - This is a generated Firefly configuration that will be used to pass the Firefly instance some basic values that are required as part of the bootstrap process,
* **private-key.pem** This is the private part of a generated key pair that will be used by firefly to authenticate to the Venafi Cloud control plane.  

```bash
[+] Running 2/0
 ✔ Network firefly-quickstart_default      Created  0.0s 
 ✔ Container firefly-quickstart-elevate-1  Created  0.0s 
Attaching to elevate-1
elevate-1  | 
elevate-1  | bootstrap:
elevate-1  |   vaas:
elevate-1  |     url: https://api.venafi.cloud
elevate-1  |     auth:
elevate-1  |       privateKeyFile: /etc/firefly/private-key.pem
elevate-1  |       clientID: 8104b51c-bf7e-11ee-9c78-4a98e9dd68c7
elevate-1  |     csr:
elevate-1  |       instanceNaming: SKO Demo
elevate-1  | server:
elevate-1  |   rest:
elevate-1  |     port: 8281
elevate-1  |     tls:
elevate-1  |       dnsNames:
elevate-1  |       - firefly.venafi.example
elevate-1  |       ipAddress: 127.0.0.1
elevate-1  | 
elevate-1 exited with code 0
```

