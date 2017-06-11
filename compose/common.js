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


/**
 * common docker compose helpers
 */
module.exports = function () {
  var portIndex = 0


  var interpretArrayCommand = function (cmdArrStr) {
    cmdArrStr = cmdArrStr.replace(/^\s+|\s+$/g, '')
    cmdArrStr = cmdArrStr.replace(/^\[|\]$/g, '')
    cmdArrStr = cmdArrStr.replace(/"|']$/g, '')
    return cmdArrStr.split(',').join('')
  }



  function handlePortRange (serviceName, range) {
    var ports = []
    var idx = 0
    var start
    var end

    if (range.length === 3) {
      start = parseInt(range[1], 10)
      end = parseInt(range[2], 10)
    } else {
      start = parseInt(range[1], 10)
      end = parseInt(range[2], 10)
      idx = parseInt(range[3], 10)
    }

    for (var i = start; i <= end; i++) {
      ++portIndex
      if (idx > 0) {
        ports.push(serviceName + portIndex + '=' + i + ':' + idx)
        ++idx
      } else {
        ports.push(serviceName + portIndex + '=' + i)
      }
    }
    return ports
  }


  var portParse = [
    {regexp: /^(\d+)$/, handler: function (serviceName, result) { ++portIndex; return [serviceName + portIndex + '=' + result[1]] }},
    {regexp: /^(\d+)-(\d+)$/, handler: function (serviceName, result) { return handlePortRange(serviceName, result) }},
    {regexp: /^(\d+):(\d+)$/, handler: function (serviceName, result) { ++portIndex; return [serviceName + portIndex + '=' + result[1] + ':' + result[2]] }},
    {regexp: /^(\d+)-(\d+):(\d+)-(\d+)$/, handler: function (serviceName, result) { return handlePortRange(serviceName, result) }},
    {regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:(\d+):(\d+)$/, handler: function (serviceName, result) { ++portIndex; return [serviceName + portIndex + '=' + result[1] + ':' + result[2]] }},
    {regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:(\d+)-(\d+)$/, handler: function (serviceName, result) { return handlePortRange(serviceName, result) }},
    {regexp: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:(\d+)-(\d+):(\d+)-(\d+)$/, handler: function (serviceName, result) { return handlePortRange(serviceName, result) }}]


  var interpretPorts = function (serviceName, ports) {
    var result = null
    var portBlock = []

    portIndex = 0
    _.each(ports, function (port) {
      _.each(portParse, function (parse) {
        if (parse.regexp.test(port)) {
          result = parse.regexp.exec(port)
          portBlock = portBlock.concat(parse.handler(serviceName, result))
        }
      })
    })

    if (portBlock[0]) {
      var splt = portBlock[0].split('=')
      portBlock[0] = serviceName + '=' + splt[1]
    }
    return portBlock
  }


  var readCommandFromDockerfile = function (root) {
    var dfPath
    var docker
    var lines
    var match
    var command = ''
    var re = /^CMD (.*)/g

    dfPath = path.join(root, 'Dockerfile')
    if (fs.existsSync(dfPath)) {
      docker = fs.readFileSync(dfPath, 'utf8')
      lines = docker.split(EOL)
      _.each(lines, function (line) {
        if ((match = re.exec(line)) !== null) {
          command = match[1]
          if (command.indexOf('[') !== -1) {
            command = interpretArrayCommand(command)
          }
        }
      })
    }
    return command.trim()
  }


  var processContainers = function (rootPath, compose) {
    var containers = {}
    _.each(_.keys(compose), function (key) {
      var src = compose[key]

      containers[key] = {}
      containers[key].name = src.name || key
      if (src.build) {
        containers[key].type = 'process'
        containers[key].path = path.resolve(path.join(rootPath, src.build))
        if (src.command) {
          containers[key].run = src.command
        } else {
          containers[key].run = readCommandFromDockerfile(containers[key].path)
        }
      } else {
        containers[key].type = 'container'
        containers[key].image = src.image
      }

      if (src.ports) {
        containers[key].ports = interpretPorts(containers[key].name, src.ports)
      }

      if (src.hostname) { containers[key].host = src.hostname }
      if (src.environment) { containers[key].environment = src.environment }
      if (src.env_file) { containers[key].env_file = src.env_file }
    })

    return containers
  }


  return {
    readCommandFromDockerfile: readCommandFromDockerfile,
    interpretPorts: interpretPorts,
    processContainers: processContainers
  }
}

