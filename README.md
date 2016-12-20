# fuge-config
Config file for fuge.

- __Sponsor:__ [nearForm][sponsor]

fuge-config - Parser for fuge configuration files.

* [Install](#install)
* [Format](#api)
* [Example](#example)
* [License](#license)


## Install
To install fuge-config, use npm:

```sh
$ npm install fuge-config
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

Settings are provided at a global and service level. Generally any global settings may be overrided at the container / service level.

## Examples
A simple example is provided below:

```
fuge_global:
  monitor_excludes:
    - /node_modules|\.git|\.log/mgi,
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
  monitor_excludes:
    - /node_modules|\.git|\.log/mgi,
  dns_enabled: true
  dns_namespace: testns
  dns_suffix: svc.cluster.local
  auto_generate_environment: true
  auto_port_start: 20000
  environment:
    - NODE_ENV=DEV
  host: 127.0.0.1
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
  auto_generate_environment: false
  dns_enabled: false
  ports:
    - tcp=27017:27017
```

In the above example fuge will generate environment variables and dns entries for frontend and service_one, however it will exclude mongo from this as these settings are disabled on this container.


## Detail

### Global Settings
Valid global settings are as follows:

<table> 
  <tr><td>name</td><td>type</td><td>effect</td><td>default</td></tr>
  
  <tr><td>run_containers</td>
      <td>boolean</td>
      <td>when enabled fuge will run docker containers specified as services</td>
      <td>true</td></tr>
      
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
      <td>provide fuge with any number of regular expressions. Any matching expressions will be excluded from monitoring</td>
      <td>[]</td></tr>

<tr><td>dns_enabled</td>
      <td>boolean</td>
      <td>when enabled will generate A and SRV records for each service.</td>
      <td>false</td></tr>

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
      <td>maximum number of times to attempt service restart</td>
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