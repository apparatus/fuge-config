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

module.exports.globalSchema = {
  title: 'Global Schema',
  type: 'object',
  properties: {
    run_containers: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['build', 'test', 'run']
      }
    },
    host: { type: 'string' },
    tail: { type: 'boolean' },
    monitor: { type: 'boolean' },
    monitor_excludes: {
      type: 'array',
      items: {
        type: 'string'
      }

    },
    dns: { type: 'boolean' },
    dns_prefix: { type: 'string' },
    dns_suffix: { type: 'string' },
    auto_generate_environment: { type: 'boolean' },
    auto_port_start: { type: 'integer' },
    environment: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[A-Za-z0-9_]+=[A-Za-z0-9_]+$'
      }
    }
  }
}

module.exports.containerSchema = {
  title: 'Container Schema',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['process', 'container']
    },
    host: { type: 'string' },
    path: { type: 'string' },
    image: { type: 'string' },
    build: { type: 'string' },
    test: { type: 'string' },
    run: { type: 'string' },
    environment: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[A-Za-z0-9_]+=[A-Za-z0-9_]+$'
      }
    },
    ports: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[A-Za-z0-9_]+=[A-Za-z0-9_]+[A-Za-z0-9_:]*$'
      }
    }
  },
  dependencies: {
    path: {
      properties: {
        type: {
          enum: ['process']
        }
      }
    },
    image: {
      properties: {
        type: {
          enum: ['container']
        }
      }
    }
  },
  required: ['type', 'run']
}

