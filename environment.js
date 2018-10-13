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
var EOL = require('os').EOL


module.exports = function () {

  function loadEnvFile (root, envFile) {
    var ef
    var env = {}
    var lines
    var expr

    var p = path.resolve(path.join(root, envFile))
    if (fs.existsSync(p)) {
      ef = fs.readFileSync(p, 'utf8')

      lines = ef.split(EOL)
      _.each(lines, function (line) {
        if (!/^#.*/g.test(line)) {
          if ((expr = /(^[A-Za-z0-9_]+)=(.+$)/g.exec(line)) !== null) {
            env[expr[1]] = expr[2]
          }
        }
      })
    }
    return env
  }



  function loadEnvFiles (yamlPath, obj) {
    var env = {}
    var block

    if (obj.env_file) {
      if (_.isArray(obj.env_file)) {
        _.each(obj.env_file, function (envFile) {
          if (obj.path) {
            block = loadEnvFile(obj.path, envFile)
          } else {
            block = loadEnvFile(path.dirname(yamlPath), envFile)
          }
          env = _.merge(env, block)
        })
      } else {
        if (obj.path) {
          block = loadEnvFile(obj.path, obj.env_file)
        } else {
          block = loadEnvFile(path.dirname(yamlPath), obj.env_file)
        }
        env = _.merge(env, block)
      }
    }
    return env
  }



  function buildEnvironmentBlock (envIn) {
    var env = {}

    if (_.isArray(envIn)) {
      if (envIn.length > 0) {
        _.each(envIn, function (ev) {
          var k = ev.substring(0, ev.indexOf('='))
          var v = ev.substring(ev.indexOf('=') + 1)
          env[k] = v
        })
      }
    } else if (_.isObject(envIn)) {
      env = envIn
    }

    return env
  }



  function findEnvVar (system, varName) {
    var result = null

    _.each(_.keys(system.topology.containers), function (key) {
      if (system.topology.containers[key].environment[varName]) {
        result = system.topology.containers[key].environment[varName]
      }
    })

    if (!result) {
      if (process.env[varName]) {
        result = process.env[varName]
      }
    }

    return result
  }



  function interpolate (system) {
    if (system.topology.containers && _.keys(system.topology.containers).length > 0) {
      _.each(_.keys(system.topology.containers), function (key) {
        var container = system.topology.containers[key]
        var cstr = JSON.stringify(container, null, 2)
        var envVar
        var value

        if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(cstr)) {
          while ((envVar = /\$\{([a-zA-Z0-9-_]+)\}/g.exec(cstr)) !== null) {
            if (container.environment[envVar[1]]) {
              if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(container.environment[envVar[1]])) {
                value = ''
              } else {
                value = container.environment[envVar[1]]
              }
              cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), value)
            } else {
              if ((value = findEnvVar(system, envVar[1])) !== null) {
                if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(value)) {
                  value = ''
                }
                cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), value)
              } else {
                cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), '')
              }
            }
          }
          system.topology.containers[key] = JSON.parse(cstr)
        }
      })
    }
  }



  function interpolate2 (system) {
    if (system.topology.containers && _.keys(system.topology.containers).length > 0) {
      _.each(_.keys(system.topology.containers), function (key) {
        var container = system.topology.containers[key]
        var cstr = container
        var envVar
        var value

        if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(cstr)) {
          while ((envVar = /\$\{([a-zA-Z0-9-_]+)\}/g.exec(cstr)) !== null) {
            if (container.environment[envVar[1]]) {
              if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(container.environment[envVar[1]])) {
                value = ''
              } else {
                value = container.environment[envVar[1]]
              }
              cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), value)
            } else {
              if ((value = findEnvVar(system, envVar[1])) !== null) {
                if (/\$\{([a-zA-Z0-9-_]+)\}/g.test(value)) {
                  value = ''
                }
                cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), value)
              } else {
                cstr = cstr.replace(new RegExp('\\$\\{' + envVar[1] + '\\}', 'g'), '')
              }
            }
          }
          system.topology.containers[key] = JSON.parse(cstr)
        }
      })
    }
  }



  return {
    loadEnvFile,
    loadEnvFiles,
    buildEnvironmentBlock,
    interpolate2,
    interpolate
  }
}

