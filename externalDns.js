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
 * add external dns entries from dns_external key which is of this form
 *
 * dns_external:
 *   - "sipserver.example.com IN A 192.0.2.1"
 *   - "_sip._tcp.example.com IN SRV 0 5 5060 sipserver.example.com"
 */
module.exports = function () {

  var parseA = /([_a-zA-Z0-9-.]+) IN A ([0-9.]+)/g
  var parseSrv = /([_a-zA-Z0-9-.]+) IN SRV ([0-9]+) ([0-9]+) ([0-9]+) ([_a-zA-Z0-9-.]+)/g


  function addExternalDns (system) {
    var result

    if (system.global.dns_external) {
      _.each(system.global.dns_external, function (record) {
        parseA.lastIndex = 0
        parseSrv.lastIndex = 0

        result = parseSrv.exec(record)
        if (!result) {
          result = parseA.exec(record)
          if (result) {
            system.global.dns.A[result[1]] = {address: result[2]}
          }
        } else {
          system.global.dns.SRV[result[1]] = {cname: result[5], port: result[4]}
        }

        if (!result) {
          console.log('WARNING! unable to parse external DNS record, skipping: ' + record)
        }
      })
    }
  }


  return {
    addExternalDns: addExternalDns
  }
}

