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
    run_containers: { type: 'boolean' },
    container_engine_url: { type: 'string' },
    host: { type: 'string' },
    tail: { type: 'boolean' },
    monitor: { type: 'boolean' },
    monitor_excludes: {
      type: 'array',
      items: {
        type: 'string'
      }

    },
    dns_enabled: { type: 'boolean' },
    dns_host: { type: 'string' },
    dns_port: { type: 'integer' },
    dns_namespace: { type: 'string' },
    dns_suffix: { type: 'string' },
    auto_generate_environment: { type: 'boolean' },
    auto_port_start: { type: 'integer' },
    delay_start: { type: 'integer' },
    restart_on_error: { type: 'boolean' },
    max_restarts: { type: 'integer' },
    environment: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[A-Za-z0-9_]+=.+$'
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
      enum: ['process', 'container', 'node']
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
    dns_enabled: { type: 'boolean' },
    dns_namespace: { type: 'string' },
    dns_suffix: { type: 'string' },
    auto_generate_environment: { type: 'boolean' },
    path: { type: 'string' },
    image: { type: 'string' },
    build: { type: 'string' },
    test: { type: 'string' },
    run: { type: 'string' },
    args: { type: 'string' },
    delay_start: { type: 'integer' },
    restart_on_error: { type: 'boolean' },
    max_restarts: { type: 'integer' },
    repository_url: { type: 'string' },
    environment: {
      type: 'array',
      items: {
        type: 'string',
        pattern: '^[A-Za-z0-9_]+=.+$'
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
          enum: ['process', 'node']
        }
      }
    },
    run: {
      properties: {
        type: {
          enum: ['process', 'node']
        }
      }
    },
    image: {
      properties: {
        type: {
          enum: ['container']
        }
      }
    },
    args: {
      properties: {
        type: {
          enum: ['container']
        }
      }
    }
  },
  required: ['type']
}

