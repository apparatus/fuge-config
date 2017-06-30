/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES LOSS OF USE, DATA, OR PROFITS OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict'

var fs = require('fs')
var path = require('path')
var loader = require('../index.js')()

function reset (name, output) {
  loader.load(path.join(__dirname, '/fixture/' + name + '.yml'), function (err, system) {
    if (err) {
      console.log('ERROR:')
      console.log(err)
    } else {
      fs.writeFile(path.join(__dirname, '/expectedResults/' + output + '.json'), JSON.stringify(system, null, 2), 'utf8', function (err) {
        if (err) {
          console.log('ERROR:')
          console.log(err)
        } else {
          console.log('done')
        }
      })
    }
  })
}

reset('config1', 'config1')
reset('blank', 'blank')
reset('missingdns', 'missingdns')
reset('noautogen', 'noautogen')
reset('nodefaults', 'nodefaults')
reset('nodefaults', 'nodefaults')
reset('composeV1/fuge', 'complexPorts')
reset('composeV2/fuge', 'complexPortsV2')
reset('composeV3/fuge', 'complexPortsV3')
reset('bugfix/case1/fuge/fuge', 'apionly')

process.env.NODE_ENV = 'debug'
reset('composeSimpleV1/fuge', 'simpleCompose')
