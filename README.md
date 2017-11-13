# Fuge-Config
Configuration file parser for fuge.

If you're using this module, and need help, you can:

- Post a [github issue][https://github.com/apparatus/fuge/issues],
- Reach out on twitter to @pelger

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
include:
  - <docker-compose-file>
```

Settings are provided at a global and per service level. Generally, any global settings may be overridden at the container / service level. Global settings are applied to all containers.

You may optionally include a list of docker-compose formatted files through the use of the include setting. Fuge supports V1, V2 and V3 docker-compose syntax.

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

In the simple example fuge will run a frontend process (called frontend) and a mongodb container. This might be the configuration for a monolithic MEAN stack application. The application can be started through the Fuge shell:

```sh
$ fuge shell <path to config file>
fuge> start all
```

A more complicated example follows:

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
  dns_external:
    - "mydatabse.mydomain.internal.com IN A 192.0.2.1"
    - "_main._tcp.mydatabse.mydomain.internal.com IN SRV 0 5 5060 mydatabase.mydomain.internal.com"
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
service_two:
  type: process
  path: ./service_two
  run: 'npm start'
mongo:
  type: container
  image: mongodb
  ports:
    - tcp=27017:27017
```

In the above example fuge will generate environment variables and dns entries for frontend, service_one, service_two and mongodb. Again the entire system can be started using the fuge shell.

## Emulating production environments
Fuge will emulate your production environment allowing you to run code with the same configuration in development as would run in production. In the example above fuge has been configured to emulate Kubernetes for local development.
Fuge will generate Kubernetes style dns entries and and environment variables. The DNS entries generated are as follows:

```sh
type  domain                                            address                                port
A     frontend.testns.svc.cluster.local                 127.0.0.1                              -
A     service_one.testns.svc.cluster.local              127.0.0.1                              -
A     service_two.testns.svc.cluster.local              127.0.0.1                              -
A     mongo.testns.svc.cluster.local                    127.0.0.1                              -
SRV   _http._tcp.frontend.testns.svc.cluster.local      frontend.testns.svc.cluster.local      3000
SRV   _main._tcp.service_one.testns.svc.cluster.local   service_one.testns.svc.cluster.local   20000
SRV   _main._tcp.service_two.testns.svc.cluster.local   service_one.testns.svc.cluster.local   20001
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
SERVICE_ONE_PORT_20000_TCP_ADDR=127.0.0.t
SERVICE_TWO_SERVICE_HOST=127.0.0.1
SERVICE_TWO_SERVICE_PORT=20001
SERVICE_TWO_PORT=tcp://127.0.0.1:20001
SERVICE_TWO_PORT_20001_TCP=tcp://127.0.0.1:20000
SERVICE_TWO_PORT_20001_TCP_PROTO=tcp
SERVICE_TWO_PORT_20001_TCP_PORT=20001
SERVICE_TWO_PORT_20001_TCP_ADDR=127.0.0.1
MONGO_SERVICE_HOST=127.0.0.1
MONGO_SERVICE_PORT=27017
MONGO_PORT=tcp://127.0.0.1:27017
MONGO_PORT_27017_TCP=tcp://127.0.0.1:27017
MONGO_PORT_27017_TCP_PROTO=tcp
MONGO_PORT_27017_TCP_PORT=27017
MONGO_PORT_27017_TCP_ADDR=127.0.0.1
NODE_ENV=DEV
```

## Environment Handling
Fuge supports loading of environment files both at the global and service scope. It also supports environment variable interpolation in the fuge config file and and included docker compose files.

## Detail

### Global Settings
Valid global settings are as follows:

### Global Settings

<table>
  <tr><td>name</td><td>type</td><td>effect</td><td>default</td></tr>

  <tr><td>run_containers</td>
      <td>boolean</td>
      <td>when enabled fuge will run docker containers using the local docker api. A container is specified as having type 'container'</td>
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
      <td>toggles tail behavior, when enabled at global level all container and process logs will be tailed</td>
      <td>true</td></tr>

<tr><td>monitor</td>
      <td>boolean</td>
      <td>toggles monitor behavior, when enabled at global level all processes will be watched for changes and restarted</td>
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

<tr><td>dns_external</td>
      <td>array of string</td>
      <td>inject addtional dns records into the fuge dns server. Can be used to connect to external databases during development</td>
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

<tr><td>env_file</td>
      <td>array of string</td>
      <td>Specifiy a list of environment files to load into the global environment</td>
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

<tr><td>include</td>
      <td>Array of string</td>
      <td>List of docker compose files to include in this fuge system</td>
      <td>[]</td></tr>
</table>

### Service Settings
Most of the global settings documented above may be specified at the service level. When specified at the service level, settings override the global options. In addition at the service level the following settings are required/allowed:

<table>
  <tr><td>name</td><td>type</td><td>effect</td><td>default</td></tr>

  <tr><td>type</td>
      <td>string</td>
      <td>one of 'process' or 'container', tells fuge how to execute this service</td>
      <td>none - required</td></tr>

  <tr><td>path</td>
      <td>string</td>
      <td>If type 'process' path is required. Relative path to the process executable</td>
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
      <td>none - required for processes</td></tr>

<tr><td>environment</td>
      <td>array of string</td>
      <td>Provide environment variables specific to this process or container. Will be merged with the global environment</td>
      <td>[]</td></tr>

<tr><td>ports</td>
      <td>array of string</td>
      <td>Provide port name value pairs specific to this process / container</td>
      <td>[]</td></tr>

</table>

## What's not supported
Fuge does not support container volumes from docker files or container linking. If you need these features then docker-compose is going to work better for you. Note however it is possible to run a portion of your system under compose (the bits that don't change much) and a portion under fuge (the bits that are under development) by setting `run_containers` to `false` and importing your docker-compose file. For an example of this see `services-and-infrastructure` sample in this repo: [https://github.com/apparatus/fuge-examples](https://github.com/apparatus/fuge-examples)

## License
Copyright Peter Elger 2016 & Contributors, Licensed under [MIT][].
