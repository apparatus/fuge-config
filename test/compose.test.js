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

var path = require('path')
var test = require('tap').test
var omitDeep = require('omit-deep')
var loader = require('../index.js')()


test('simple configuration and env file load and interpolation', function (t) {
  t.plan(2)

  process.env.NODE_ENV = 'debug'
  var expected = require(path.join(__dirname, '/expectedResults/simpleCompose.json'))
  loader.load(path.join(__dirname, 'fixture', 'composeSimpleV1', 'fuge.yml'), function (err, system) {
    system = omitDeep(system, ['path'])
    t.equal(err, null, 'check no errors')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('complex port configuration', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/complexPorts.json'))
  loader.load(path.join(__dirname, 'fixture', 'composeV1', 'fuge.yml'), function (err, system) {
    system = omitDeep(system, ['path'])
    t.equal(err, null, 'check no errors')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('complex port configuration V2 syntax', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/complexPortsV2.json'))
  loader.load(path.join(__dirname, 'fixture', 'composeV2', 'fuge.yml'), function (err, system) {
    system = omitDeep(system, ['path'])
    t.equal(err, null, 'check no errors')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('complex port configuration V3 syntax', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/complexPortsV3.json'))
  loader.load(path.join(__dirname, 'fixture', 'composeV3', 'fuge.yml'), function (err, system) {
    system = omitDeep(system, ['path'])
    t.equal(err, null, 'check no errors')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})

