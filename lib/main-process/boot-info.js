import path from 'path'
import { debuglog } from 'util'

import app from 'app'

import levelup from 'levelup'
import jsondown from 'jsondown'

import { appDataDir } from './utils'

var log = debuglog('boot-info')

var dbPath = path.join(app.getPath('userData'), 'boot-info.json')

var opts = {
  db: jsondown,
}

var db = levelup(dbPath, opts)
  .on('opening', () => { log('opening', dbPath) })
  .on('closing', () => { log('closing') })
  .on('ready', () => { log('ready') })
  .on('closed', () => { log('closed') })
  .on('put', (key, value) => { log('put', key, value) })
  .on('del', key => { log('del', key) })
  .on('batch', ary => { log('batch', ary) })
  .on('error', err => { throw err })

export default db
