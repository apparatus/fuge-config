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
var loader = require('../index.js')()


test('load good config', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/config1.json'))
  loader.load(path.join(__dirname, '/fixture/config1.yml'), function (err, system) {
    t.equal(null, err, 'check err is null')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('load blank config', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/blank.json'))
  loader.load(path.join(__dirname, '/fixture/blank.yml'), function (err, system) {
    t.equal(null, err, 'check err is null')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('load config with no autogeneration of environment', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/noautogen.json'))
  loader.load(path.join(__dirname, '/fixture/noautogen.yml'), function (err, system) {
    t.equal(null, err, 'check err is null')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('load config with no default overrides', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/nodefaults.json'))
  loader.load(path.join(__dirname, '/fixture/nodefaults.yml'), function (err, system) {
    t.equal(null, err, 'check err is null')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('test missing dns settings', function (t) {
  t.plan(2)

  var expected = require(path.join(__dirname, '/expectedResults/missingdns.json'))
  loader.load(path.join(__dirname, '/fixture/missingdns.yml'), function (err, system) {
    t.equal(null, err, 'check err is null')
    t.deepEqual(system, expected, 'check system matches expected')
  })
})


test('load nonparseable config', function (t) {
  t.plan(1)

  loader.load(path.join(__dirname, '/fixture/nonparse.yml'), function (err, system) {
    t.notEqual(null, err, 'check err is not null')
  })
})


test('load invalid config', function (t) {
  t.plan(1)

  loader.load(path.join(__dirname, '/fixture/invalid.yml'), function (err, system) {
    t.notEqual(null, err, 'check err is not null')
  })
})


test('load invalid global config', function (t) {
  t.plan(1)

  loader.load(path.join(__dirname, '/fixture/invalidGlobal.yml'), function (err, system) {
    t.notEqual(null, err, 'check err is not null')
  })
})

