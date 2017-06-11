/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict'

var _ = require('lodash')


/**
 * generate environment block and dns entries compatible with kube
 *
 *  <service name>_SERVICE_HOST: bibble
 *  <service name>_SERVICE_PORT: 3000
 *  <service name>_PORT=tcp://bibble:3000
 *  <service name>_PORT_<port number>_TCP=http://bibble:3000
 *  <service name>_PORT_<port number>_TCP_PROTO=tcp
 *  <service name>_PORT_<port number>_TCP_PORT=3000
 *  <service name>_PORT_<port number>_TCP_ADDR=addr
 */
module.exports = function () {

  function generateEnvForContainer (system, key, sharedEnv) {
    var upcaseKey = key.toUpperCase()

    var host = system.topology.containers[key].host

    _.each(_.keys(system.topology.containers[key].ports), function (pkey) {
      var port = system.topology.containers[key].ports[pkey][0]

      if (!system.topology.containers[key].environment[upcaseKey + '_SERVICE_PORT']) {
        system.topology.containers[key].environment[upcaseKey + '_SERVICE_HOST'] = host
        system.topology.containers[key].environment[upcaseKey + '_SERVICE_PORT'] = port
        system.topology.containers[key].environment[upcaseKey + '_PORT'] = 'tcp://' + host + ':' + port

        sharedEnv[upcaseKey + '_SERVICE_HOST'] = host
        sharedEnv[upcaseKey + '_SERVICE_PORT'] = port
        sharedEnv[upcaseKey + '_PORT'] = 'tcp://' + host + ':' + port
      }
      system.topology.containers[key].environment[upcaseKey + '_PORT_' + port + '_TCP'] = 'tcp://' + host + ':' + port
      system.topology.containers[key].environment[upcaseKey + '_PORT_' + port + '_TCP_PROTO'] = 'tcp'
      system.topology.containers[key].environment[upcaseKey + '_PORT_' + port + '_TCP_PORT'] = port
      system.topology.containers[key].environment[upcaseKey + '_PORT_' + port + '_TCP_ADDR'] = host
      sharedEnv[upcaseKey + '_PORT_' + port + '_TCP'] = 'tcp://' + host + ':' + port
      sharedEnv[upcaseKey + '_PORT_' + port + '_TCP_PROTO'] = 'tcp'
      sharedEnv[upcaseKey + '_PORT_' + port + '_TCP_PORT'] = port
      sharedEnv[upcaseKey + '_PORT_' + port + '_TCP_ADDR'] = host
    })
  }



  function generateDnsForContainer (system, key) {
    var namespace = ''
    var suffix = ''

    if (system.global.dns_suffix) {
      suffix = '.' + system.global.dns_suffix
    }

    if (system.global.dns_namespace) {
      namespace = '.' + system.global.dns_namespace
    }

    if (!system.global.dns) {
      system.global.dns = {A: {}, SRV: {}}
    }


    if (_.keys(system.topology.containers[key].ports).length > 0) {
      var host = system.topology.containers[key].host
      system.global.dns.A[key + namespace + suffix] = {address: host}

      _.each(_.keys(system.topology.containers[key].ports), function (pkey) {
        var port = system.topology.containers[key].ports[pkey][0]
        system.global.dns.SRV['_' + pkey + '._tcp.' + key + namespace + suffix] = {address: host, cname: key + namespace + suffix, port: port}
      })
    }
  }



  return {
    generateEnvForContainer: generateEnvForContainer,
    generateDnsForContainer: generateDnsForContainer
  }
}

