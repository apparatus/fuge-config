# fuge-config
Configuration file parser for fuge.

- __Sponsor:__ [nearForm][sponsor]

* [Install](#install)
* [Format](#api)
* [Example](#example)
* [License](#license)


## Install
fuge-config provides configuration file parsing for `fuge`. To install fuge use npm:

```sh
$ npm install -g fuge
```


## Format
The fuge config file format is yaml based and is structured as follows:

```
fuge_global:
  .
  .
  <global settings>
  .
  .
<service1 settings>:
  .
  .
<service2 settings>:
  .
  .
```

Settings are provided at a global and per service level. Generally any global settings may be overridden at the container / service level. Global settings are applied to all containers.


## Examples
A simple example is provided below:

```
fuge_global:
  run_containers: true
  monitor_excludes:
    - '**/node_modules/**'
    - '**/.git/**'
    - '*.log'
  environment:
    - NODE_ENV=DEV
frontend:
  type: process
  path: ./frontend
  run: 'npm start'
  ports:
    - http=3000
mongo:
  type: container
  image: mongodb
  ports:
    - tcp=27017:27017
```

In the simple example fuge will run a frontend process (called frontend) and a mongodb container. This might be the configuration for a monolithic mean stack application. A more complicated example follows:

```
fuge_global:
  run_containers: true
  host: 127.0.0.1
  monitor_excludes:
    - '**/node_modules/**'
    - '**/.git/**'
    - '*.log'
  dns_enabled: true
  dns_namespace: testns
  dns_suffix: svc.cluster.local
  auto_generate_environment: true
  auto_port_start: 20000
  environment:
    - NODE_ENV=DEV
frontend:
  delay_start: 5
  type: process
  path: ./frontend
  run: 'npm start'
  ports:
    - http=3000
service_one:
  type: process
  path: ./service_one
  run: 'npm start'
mongo:
  type: container
  image: mongodb
  ports:
    - tcp=27017:27017
```

In the above example fuge will generate environment variables and dns entries for frontend, service_one and mongodb.

## Emulating production environments
Fuge will emulate your production environment allowing you to run code with the same configuration in development as would run in production. In the example above fuge has been configured to emulate Kubernetes for local development.
Fuge will generate Kubernetes style dns entries and and environment variables. The DNS entries generated are as follows:

```sh
type  domain                                            address                                port
A     frontend.testns.svc.cluster.local                 127.0.0.1                              -
A     service_one.testns.svc.cluster.local              127.0.0.1                              -
A     mongo.testns.svc.cluster.local                    127.0.0.1                              -
SRV   _http._tcp.frontend.testns.svc.cluster.local      frontend.testns.svc.cluster.local      3000
SRV   _main._tcp.service_one.testns.svc.cluster.local   service_one.testns.svc.cluster.local   20000
SRV   _tcp._tcp.mongo.testns.svc.cluster.local          mongo.testns.svc.cluster.local         27017
```
  

Fuge will also generate Kubernetes style environment variables as follows from the above example:

```sh
FRONTEND_SERVICE_HOST=127.0.0.1
FRONTEND_SERVICE_PORT=3000
FRONTEND_PORT=tcp://127.0.0.1:3000
FRONTEND_PORT_3000_TCP=tcp://127.0.0.1:3000
FRONTEND_PORT_3000_TCP_PROTO=tcp
FRONTEND_PORT_3000_TCP_PORT=3000
FRONTEND_PORT_3000_TCP_ADDR=127.0.0.1
DNS_HOST=0.0.0.0
DNS_PORT=53053
DNS_NAMESPACE=testns
DNS_SUFFIX=svc.cluster.local
SERVICE_ONE_SERVICE_HOST=127.0.0.1
SERVICE_ONE_SERVICE_PORT=20000
SERVICE_ONE_PORT=tcp://127.0.0.1:20000
SERVICE_ONE_PORT_20000_TCP=tcp://127.0.0.1:20000
SERVICE_ONE_PORT_20000_TCP_PROTO=tcp
SERVICE_ONE_PORT_20000_TCP_PORT=20000
SERVICE_ONE_PORT_20000_TCP_ADDR=127.0.0.1
MONGO_SERVICE_HOST=127.0.0.1
MONGO_SERVICE_PORT=27017
MONGO_PORT=tcp://127.0.0.1:27017
MONGO_PORT_27017_TCP=tcp://127.0.0.1:27017
MONGO_PORT_27017_TCP_PROTO=tcp
MONGO_PORT_27017_TCP_PORT=27017
MONGO_PORT_27017_TCP_ADDR=127.0.0.1
NODE_ENV=DEV
```

## Detail

### Global Settings
Valid global settings are as follows:

### Global Settings

<table>
  <tr><td>name</td><td>type</td><td>effect</td><td>default</td></tr>

  <tr><td>run_containers</td>
      <td>boolean</td>
      <td>when enabled fuge will run docker containers specified as services</td>
      <td>true</td></tr>

  <tr><td>container_engine_url</td>
      <td>url</td>
      <td>The url to used to connect to the Docker container engine (e.g. /var/run/docker.sock). If not set this will be picked up from the environment.</td>
      <td>''</td></tr>

  <tr><td>host</td>
      <td>string</td>
      <td>Host name or IP address to use for this host when starting Docker containers</td>
      <td>127.0.0.1</td></tr>

<tr><td>tail</td>
      <td>boolean</td>
      <td>toggles tail behaviour, when enabled at global level all service logs will be tailed</td>
      <td>true</td></tr>

<tr><td>monitor</td>
      <td>boolean</td>
      <td>toggles monitor behaviour, when enabled at global level all services will be watched for changes and restared</td>
      <td>true</td></tr>

<tr><td>monitor_excludes</td>
      <td>array of regex</td>
      <td>Array of [anymatch](https://github.com/es128/anymatch) compatible path expressions that should be excluded from monitoring typically this should be set to ['**/node_modules/**', '**/.git/**', '*.log' or similar</td>
      <td>[]</td></tr>

<tr><td>dns_enabled</td>
      <td>boolean</td>
      <td>when enabled will start the internal fuge DNS sever and generate A and SRV records for each service.</td>
      <td>false</td></tr>

<tr><td>dns_host</td>
      <td>string</td>
      <td>host ip address for dns server to bind to.</td>
      <td>0.0.0.0</td></tr>

<tr><td>dns_port</td>
      <td>integer</td>
      <td>port for dns server</td>
      <td>53053</td></tr>

<tr><td>dns_namespace</td>
      <td>string</td>
      <td>Used as a global namespace during dns name generation</td>
      <td>''</td></tr>

<tr><td>dns_suffix</td>
      <td>string</td>
      <td>Used as a global suffix during dns name generation</td>
      <td>''</td></tr>

<tr><td>auto_generate_environment</td>
      <td>boolean</td>
      <td>When enabled fuge will generate an environment variable block for each service</td>
      <td>true</td></tr>

<tr><td>auto_port_start</td>
      <td>integer</td>
      <td>Provide a base port number to use during environment generation</td>
      <td>10000</td></tr>

<tr><td>environment</td>
      <td>array of string</td>
      <td>Provide global environment variables to each service</td>
      <td>[]</td></tr>

<tr><td>host</td>
      <td>string</td>
      <td>provide a global host name or ip address</td>
      <td>localhost</td></tr>

<tr><td>delay_start</td>
      <td>integer</td>
      <td>delay this many seconds when starting processes</td>
      <td>0</td></tr>

<tr><td>restart_on_error</td>
      <td>boolean</td>
      <td>attempt to restart crashed service processes</td>
      <td>false</td></tr>

<tr><td>max_restarts</td>
      <td>integer</td>
      <td>maximum number of times to attempt service restart after crash</td>
      <td>5</td></tr>
</table>

### Service Settings
All of the global settings documented above may be specififed at the service level. When specified at the service level settings override the global options. In addition at the service level the following additional settings are required/allowed:

<table>
  <tr><td>name</td><td>type</td><td>effect</td><td>default</td></tr>

  <tr><td>type</td>
      <td>string</td>
      <td>one of 'process' or 'container', tells fuge how to execute this service</td>
      <td>none - required</td></tr>

  <tr><td>path</td>
      <td>string</td>
      <td>If type 'process' path is requried. Relative path to the process executable</td>
      <td>none - required if process</td></tr>

  <tr><td>image</td>
      <td>string</td>
      <td>If type 'container' image is requried. Name of the docker container to execute</td>
      <td>none - required if container</td></tr>

  <tr><td>build</td>
      <td>string</td>
      <td>build script for the process, relative to the path setting </td>
      <td>''</td></tr>

  <tr><td>test</td>
      <td>string</td>
      <td>test script for the process, relative to the path setting </td>
      <td>''</td></tr>

  <tr><td>run</td>
      <td>string</td>
      <td>run script for the process, relative to the path setting </td>
      <td>none - required</td></tr>

<tr><td>environment</td>
      <td>array of string</td>
      <td>Provide environment variables specific to this service. Will be merged with the global environment</td>
      <td>[]</td></tr>

<tr><td>ports</td>
      <td>array of string</td>
      <td>Provide port name value pairsspecific to this service</td>
      <td>[]</td></tr>

</table>


## License
Copyright Peter Elger 2016 & Contributors, Licensed under [MIT][].
