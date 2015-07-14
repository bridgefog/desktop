import { assert } from 'chai'
import Swarm from '../../../lib/discovery/swarm'

describe('Discovery/Swarm', () => {
  describe('constructor', () => {
    it('accepts this.onKey in object argument', () => {
      var cb = Function()
      var swarm = new Swarm({ onKey: cb })
      assert.equal(swarm.onKey, cb)
    })
  })

  describe('#gotKey()', () => {
    it('calls this.onKey with the key', (done) => {
      var swarm = new Swarm()
      swarm.onKey = key => {
        assert.equal(key, 'QmYNmQKp6SuaVrpgWRsPTgCQCnpxUYGq76YEKBXuj2N4H6')
        done()
      }
      swarm.gotKey('QmYNmQKp6SuaVrpgWRsPTgCQCnpxUYGq76YEKBXuj2N4H6')
    })
  })
})
