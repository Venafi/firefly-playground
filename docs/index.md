---
icon: material/information-outline
tags:
  - v0.1
  - brand new
---




# What is {{ component_name }}

{{ component_name }} - Ephemeral lightweight micro-service for machine identities with a :material-graphql: GraphQL (1) API. 
{ .annotate }

1.  :material-graphql: GraphQL is a query language for APIs and a runtime for fulfilling those queries with your existing data. GraphQL provides a complete and understandable description of the data in your API, gives clients the power to ask for exactly what they need and nothing more, makes it easier to evolve APIs over time, and enables powerful developer tools.


{{ component_name }} provides a single binary or Docker image that is super easy to deploy or re-deploy. It can run as an in-memory intermediate (subCA) issuer for machine identities or as a dynamic policy router for Venafi TPP or VaaS. It can also run as its own self-signed machine identity provider for test and development. When running as an intermediate issuer it can provide its own policy controls or be synchronised with centralised TPP or VaaS policies. 

## Use Cases

Whilst not limited in any way, the following table provides some example use cases for {{ component_name }}.

| Example Use Case                                                                                 | Description                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dynamic TPP/VaaS policy routing                                                                  | Implement A dynamic TPP or VaaS policy router based on JSON Web Token (JWT) claims with a GraphQL API. Use GraphQL with JWT claims to provide dynamic routing to TPP or VaaS policies.     |
| ephemeral in-memory local Issuer for machine identities                                          | An ephemeral in-memory issuer for machine identities dynamically bootstrapped from TPP policies with a GraphQL API. Can be deployed anywhere that requires extremely low latency issuance. |
| Bind Machine Identity management services to other `data` repositories with a single unified API | Add (stitch) machine identity management capabilities to  existing data sources (schemas) via a single unified and developer friendly API.                                                 |
| Machine Identity management integration over Pub/Sub for modern micro-services                   | Easy access to machine identities from anywhere using simple Pub/Sub mechanisms.                                                                                                           |
|                                                                                                  |                                                                                                                                                                                            |

* Policy Sync - define a base Parent DN in TPP and have the sub policies synced down to a local policy cache in EdgeCA. This should also include the policy from the parent itself. 
  * Add graph query to show policies
    * Return vcert and openssl strings/fields in GraphQL response that includes the vcert and openSSL commands. 
* Pub/Sub - GraphQL requests over GraphQL - essentially expose everything over a message queue broker. 
* In subCA mode upload issued certs to TPP. 
* Event streaming - DataDog. Seperare component. `edgeStream` that hooks into edgeCA and gets events. 



## Dynamic Policy Router

{{ component_name }} can be configured to provide a machine identity router service or middleware. The routing decision is made based on JWT claims that are defined during the authentication and JWT signing process. {{ component_name }} implements simple rules that can be used to dynamically map JWT claims to TPP policies based on customisable meta-data. After validating a JWT, {{ component_name }} then inspects its payload to determine which TPP policy will be used to fulfil the request. 

## In-memory local Issuer

{{ component_name }} can be also be configured to run as its own machine identity issuer using an exiting intermediate signing certificate or preferably directly from Venafi TPP. If a TPP service is defined, {{ component_name }} can automatically request a certificate from a predefined TPP policy and then initialise itself as issuer. The private key remains in-memory, however it can also be stored in an physical or soft HSM. 

## Policies

### Local

Talk about local policies here and provide an example.

### Remote

Talk about remote TPP/VaaS policy sync here. Need to get Siggi to enable this. 

=== "C"

    ``` c
    #include <stdio.h>

    int main(void) {
      printf("Hello world!\n");
      return 0;
    }
    ```

=== "C++"

    ``` c++
    #include <iostream>

    int main(void) {
      std::cout << "Hello world!" << std::endl;
      return 0;
    }
    ```




gerwgerwtgewrtywertyewrtyrew
tewrterwtewrtwertwertrew
terwterwtre

!!! example

    === "Unordered List"

        ``` markdown
        * Sed sagittis eleifend rutrum
        * Donec vitae suscipit est
        * Nulla tempor lobortis orci
        ```

    === "Ordered List"

        ``` markdown
        1. Sed sagittis eleifend rutrum
        2. Donec vitae suscipit est
        3. Nulla tempor lobortis orci
        ```



---- 





## Overview 

This quick-start playground is intended to showcase Venafi's {{ component_name }} ephemeral CA in the shortest possible time. Assuming the following prerequisites, it should take less than 60 seconds to deploy a fully functioning {{ component_name }} instance in a Github CodeSpaces or local Docker environment. 

### Prerequisites 

You will require one of the following to proceed.

!!! Options

    === "Run Playground in GitHub CodeSpaces"

        The following prerequisites can be used to run the {{ component_name }} playground in a GitHub CodeSpaces environment. This option has local dependencies and can be run entirely in a browser. 

        ---
        
        * A working GitHub account 
        * Venafi Cloud account for {{ component_name }} - you can signup for a free 30 day trial [here](https://venafi.com/try-venafi/firefly/)
        * An API key for your Venafi Cloud account. This can be obtained as follows: 
            1. Log in to TLS Protect Cloud.
            2. In the menu bar, click your **avatar** in the top-right corner, and then click **Preferences**.
            3. On the **API Keys** tab, click ![copy button](https://docs.venafi.cloud/api/img/ico-copy-paste.png) to generate and copy your API key.
    
    
    === "Run Playground in local Docker environment"

        The following prerequisites can be used to run the Firefly playground in your own Docker environment. This option has has local dependencies.

        ---
        
        *  Access to a fairly recent Docker runtime environment 
        *  Venafi Cloud account for Firefly - you can signup for a free 30 day trial [here](https://venafi.com/try-venafi/firefly/)
        * An API key for your Venafi Cloud account. This can be obtained as follows: 
            1. Log in to TLS Protect Cloud.
            2. In the menu bar, click your **avatar** in the top-right corner, and then click **Preferences**.
            3. On the **API Keys** tab, click ![copy button](https://docs.venafi.cloud/api/img/ico-copy-paste.png) to generate and copy your API key.
        
        
## Audience

The intended audience for this playground is: 

* New or existing Venafi customers wanting to quickly see Firefly working within their own environments.
* InfoSec teams wanting to learn more about service that they can provide to cloud native developers, SRE's and platform engineering teams.
* Developers, SRE's and platform engineering teams wanting to learn more about the services that Info Sec teams should be providing 
* Internal Venafi staff wanting to demonstrate Firefly to partners and customers.

## Get Started

The quick-start demo runs entirely in Docker and consists of three container images that a pulled from the public Docker repositories. 

:octicons-container-24: &nbsp; *3goats/elevate* - This a utility application that automates all of the required Venafi SaaS (control plane tasks) that would ordinarily be performed by an InfoSec team. Whilst these tasks can be performed manually, the utility helps by fully automating the configuration, thus new users get to see Firefly working much quicker.

:octicons-container-24: &nbsp; *tr1ck3r/jwt-this* - **jwt-this** (pronounced "jot this") is a command line utility I created to simplify demonstration, evaluation, and simple testing with Venafi Firefly. When run, it generates a new signing key pair, uses it to sign and output a new JSON Web Token (JWT) containing specified *Firefly*-related claims, and starts a basic HTTP server (listening on port 8000 by default) where the signing public key is published via a JSON Web Key Set (JWKS) so it can be used by *Firefly* to verify the signature of the JWT.

:octicons-container-24: &nbsp; *public.ecr.aws/venafi-images/firefly* - This is the main Firefly instance that will be initialised for the demonstration

The demonstration uses a single `docker-compose`file (docker-compose.yaml) that automates the three containers as follows:

## Launching the Firefly Playground using Github CodeSpaces

A codespace is a development environment that's hosted in the cloud. The {{ component_name }} playground GitHub repository provides a custom dev container that includes all of the prerequisites that are required. 

1. Login to your GitHub account and goto https://github.com/Venafi/firefly-playground
2. Create a new CodeSpace by clicking on the "Code" button, then "Create codespace on main" e.g. <figure markdown>
  ![Image title](images/github-codespaces.png){ width="400" }
</figure>

3. This will build and launch a new dev container which will take a few minutes to complete. You should then see 

## Running the Firefly Demo




???+ warning "Important"

    You must edit the `docker-compose.yaml` file to include a valid Venafi cloud API key (referenced in the prerequisites) at the placeholder. This is the only thing you need to change.

To get the api key 


```yaml
services:
  elevate:
    image: "3goats/elevate"
    command: --api-key <<< Replace this with Venafi cloud API key >>> -f /config/general-config.yaml --force -p demo -t demo
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

