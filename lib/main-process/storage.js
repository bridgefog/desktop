import { debuglog } from 'util'

import levelup from 'levelup'

import { appDataDir } from './utils'

var dbFile = appDataDir('db')
var log = debuglog('storage')

var opts = {
  keyEncoding: 'json',
  valueEncoding: 'json',
}

var db = levelup(dbFile, opts)
  .on('opening', () => { log('opening') })
  .on('closing', () => { log('closing') })
  .on('ready', () => { log('ready') })
  .on('closed', () => { log('closed') })
  .on('put', (key, value) => { log('put', key, value) })
  .on('del', key => { log('del', key) })
  .on('batch', ary => { log('batch', ary) })
  .on('error', err => { throw err })

export default db
