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

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var yaml = require('js-yaml')
var Validator = require('jsonschema').Validator
var schemas = require('./schemas')
var kubeEnv = require('./kubeEnv')()


/**
 * loads a fuge yaml configuration file and returns a javascript object describing the system
 *
 * outputs system object of the form
 *
 * {
 *   global:
 *   topology: { containers: { name: container...
 *
 * note that this currently generates a system configuration that is compatible with old style docker based config
 * for backwards compatibility
 *
 * or funge existing code into this format
 * or rewrite existing code to do this?? - might make more sense
 */
/*
 * todo:
 * - generate dns lookups based on settings here also
 * - complete unit tests - more stringent test cases
 *
 *   restart_on_error  - field
 *   max_restart_count - field
 *     - add these in
 */

module.exports = function () {

  function validateInput (yamlPath, system, cb) {
    var v = new Validator()
    var result = v.validate(system.global, schemas.globalSchema)
    var message = ''

    if (result.errors && result.errors.length > 0) {
      _.each(result.errors, function (error) {
        message += 'global settings: ' + error.stack + '\n'
      })
    }

    if (system.topology.containers && _.keys(system.topology.containers).length > 0) {
      _.each(_.keys(system.topology.containers), function (key) {
        result = v.validate(system.topology.containers[key], schemas.containerSchema)
        if (result.errors && result.errors.length > 0) {
          _.each(result.errors, function (error) {
            message += 'element: ' + key + ', error:  ' + error.stack + '\n'
          })
        }
        if (system.topology.containers[key].path) {
          var p = path.resolve(path.join(path.dirname(yamlPath), system.topology.containers[key].path))
          if (!fs.existsSync(p)) {
            message += 'element: ' + key + ', path does not exist: ' + p + '\n'
          }
        }
      })
    }
    cb(message.length > 0 ? message : null)
  }



  function setGlobalDefaults (system) {
    if (!system.global.hasOwnProperty('run_containers')) { system.global.run_containers = false }
    if (!system.global.hasOwnProperty('tail')) { system.global.tail = true }
    if (!system.global.hasOwnProperty('monitor')) { system.global.monitor = true }
    if (!system.global.hasOwnProperty('monitor_excludes')) { system.global.monitor_excludes = [] }
    if (!system.global.hasOwnProperty('dns_enabled')) { system.global.dns_enabled = false }
    if (!system.global.hasOwnProperty('dns_suffix')) { system.global.dns_suffix = '' }
    if (!system.global.hasOwnProperty('dns_namespace')) { system.global.dns_namespace = '' }
    if (!system.global.hasOwnProperty('auto_generate_environment')) { system.global.auto_generate_environment = true }
    if (!system.global.hasOwnProperty('environment')) { system.global.environment = [] }
    if (!system.global.hasOwnProperty('delay_start')) { system.global.delay_start = 0 }
    if (!system.global.hasOwnProperty('restart_on_error')) { system.global.restart_on_error = false }
    if (!system.global.hasOwnProperty('max_restarts')) { system.global.max_restarts = 5 }
  }



  function expandContainers (yamlPath, system) {
    var env = {}
    var ports = {}
    var sharedEnv = {}
    var servicePortAuto

    if (system.global.auto_generate_environment) {
      servicePortAuto = system.global.auto_port_start || 10000
    }

    if (system.topology.containers && _.keys(system.topology.containers).length > 0) {
      _.each(_.keys(system.topology.containers), function (key) {

        // auto assign a port number if rquired
        if (system.global.auto_generate_environment) {
          if (!system.topology.containers[key].ports || system.topology.containers[key].ports.length === 0) {
            system.topology.containers[key].ports = ['main=' + servicePortAuto]
            ++servicePortAuto
          }
        }

        // replace relative path with absolute
        if (system.topology.containers[key].path) {
          system.topology.containers[key].path = path.resolve(path.join(path.dirname(yamlPath), system.topology.containers[key].path))
        }

        // create environment block for this container
        if (system.topology.containers[key].environment && system.topology.containers[key].environment.length > 0) {
          env = {}
          _.each(system.topology.containers[key].environment, function (ev) {
            var s = ev.split('=')
            env[s[0]] = s[1]
          })
          system.topology.containers[key].environment = _.merge(_.cloneDeep(system.global.environment), env)
        } else {
          system.topology.containers[key].environment = _.cloneDeep(system.global.environment)
        }

        // create ports block for this container
        if (system.topology.containers[key].ports && system.topology.containers[key].ports.length > 0) {
          ports = {}
          _.each(system.topology.containers[key].ports, function (port) {
            var s = port.split('=')
            var t = s[1].split(':')
            ports[s[0]] = [t[0], t[1]]
          })
          system.topology.containers[key].ports = _.cloneDeep(ports)
        } else {
          system.topology.containers[key].ports = {}
        }

        // set hostname for this container to global default if not set
        if (!system.topology.containers[key].host) {
          system.topology.containers[key].host = system.global.host
        }

        // set tail behaviour for this container to global default if not set
        if (!system.topology.containers[key].hasOwnProperty('tail')) {
          system.topology.containers[key].tail = system.global.tail
        }

        // set monitor behaviour for this container to global default if not set
        if (!system.topology.containers[key].hasOwnProperty('monitor')) {
          system.topology.containers[key].monitor = system.global.monitor
        }

        // set monitor exclude array for this container to global default if not set
        if (!system.topology.containers[key].monitor_excludes) {
          system.topology.containers[key].monitor_excludes = system.global.monitor_excludes
        }

        // set delay start for this container to global default if not set
        if (!system.topology.containers[key].hasOwnProperty('delay_start')) {
          system.topology.containers[key].delay_start = system.global.delay_start
        }

        // set restart behaviour for this container to global default if not set
        if (!system.topology.containers[key].hasOwnProperty('restart_on_error')) {
          system.topology.containers[key].restart_on_error = system.global.restart_on_error
        }

        // set restart count behaviour for this container to global default if not set
        if (!system.topology.containers[key].hasOwnProperty('max_restarts')) {
          system.topology.containers[key].max_restarts = system.global.max_restarts
        }


        // auto generate environment block for this container if required
        if (!system.topology.containers[key].hasOwnProperty('auto_generate_environment')) {
          system.topology.containers[key].auto_generate_environment = system.global.auto_generate_environment
        }
        if (system.topology.containers[key].auto_generate_environment) {
          kubeEnv.generateEnvForContainer(system, key, sharedEnv)
        }

        // set dns suffix for this container to global default if not set
        if (!system.topology.containers[key].dns_suffix) {
          system.topology.containers[key].dns_suffix = system.global.dns_suffix
        }

        // set dns namespace for this container to global default if not set
        if (!system.topology.containers[key].dns_namespace) {
          system.topology.containers[key].dns_namespace = system.global.dns_namespace
        }

        // generate dns entries for this container if required
        if (!system.topology.containers[key].hasOwnProperty('dns_enabled')) {
          system.topology.containers[key].dns_enabled = system.global.dns_enabled
        }
        if (system.topology.containers[key].dns_enabled) {
          kubeEnv.generateDnsForContainer(system, key)
        }
      })

      // merge the global shared env into each container if required
      if (system.global.auto_generate_environment) {
        _.each(_.keys(system.topology.containers), function (key) {
          system.topology.containers[key].environment = _.merge(_.cloneDeep(sharedEnv), system.topology.containers[key].environment)
        })
      }
    }
  }



  function buildGlobalEnvironment (system) {
    var env = {}

    if (system.global.environment.length > 0) {
      _.each(system.global.environment, function (ev) {
        var s = ev.split('=')
        env[s[0]] = s[1]
      })
    }
    system.global.environment = env

    if (!system.global.host) {
      system.global.host = 'localhost'
    }
  }



  function load (yamlPath, cb) {
    var yml
    var system = { global: {}, topology: { containers: {} } }

    try {
      yml = yaml.safeLoad(fs.readFileSync(yamlPath, 'utf8'))
    } catch (ex) {
      return cb(ex.message)
    }

    system.global = yml.fuge_global || {}
    _.each(_.keys(yml), function (key) {
      if (key !== 'fuge_global') {
        system.topology.containers[key] = yml[key]
        system.topology.containers[key].name = key
        system.topology.containers[key].specific = {}
      }
    })

    validateInput(yamlPath, system, function (err) {
      if (err) { return cb(err) }
      setGlobalDefaults(system)
      buildGlobalEnvironment(system)
      expandContainers(yamlPath, system)
      cb(null, system)
    })
  }



  return {
    load: load
  }
}

