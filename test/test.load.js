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

var test = require('tap').test
var loader = require('../index.js')()
var stringify = require('json-stringify-safe')


test('load good config', function (t) {
  t.plan(2)

  loader.load('./fixture/config1.yml', function (err, system) {
    t.equal(null, err, 'check err is null')
    console.log(stringify(system, null, 2))
    // check global defaults
    // check specific containers
    t.pass()
  })
})


// load several bad configs and check that rejected
test('load bad config', function (t) {
  t.plan(2)

  loader.load('./fixture/config1.yml', function (err, system) {
    t.equal(null, err, 'check err is null')
    console.log(system)
    // check global defaults
    // check specific containers
    t.pass()
  })
})

