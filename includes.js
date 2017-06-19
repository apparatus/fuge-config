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

var yaml = require('js-yaml')
var _ = require('lodash')

var interpreters = {
  v1: require('./compose/composeV1'),
  v2: require('./compose/composeV2'),
  v3: require('./compose/composeV3')
}


/**
 * process include files for fuge config
 */
module.exports = function () {


  function interpretIncludes (list) {
    var containers = {}

    _.each(list, function (inc) {
      if (!inc.contents.version) {
        containers = _.merge(containers, interpreters.v1(inc.composeRootPath, inc.contents))
      } else {
        if (/^2.*/g.test(inc.contents.version)) {
          containers = _.merge(containers, interpreters.v2(inc.composeRootPath, inc.contents))
        }
        if (/^3.*/g.test(inc.contents.version)) {
          containers = _.merge(containers, interpreters.v3(inc.composeRootPath, inc.contents))
        }
      }
    })
    return containers
  }



  function process (yamlPath, fugeYml) {
    var include
    var toProcess = []

    if (fugeYml['include']) {
      include = fugeYml.include

      _.each(include, function (filePath) {
        var composeFilePath = path.resolve(path.join(path.dirname(yamlPath), filePath))
        toProcess.push({composeRootPath: path.dirname(composeFilePath),
          contents: yaml.safeLoad(fs.readFileSync(composeFilePath, 'utf8'))})
      })
      fugeYml.include = null
      delete fugeYml.include

      return interpretIncludes(toProcess)
    }
  }



  return {
    process: process
  }
}

