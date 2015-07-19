import childProcess from 'child_process'

import R from 'ramda'

export function spawnProcP(command, args, options) {
  var logName = [command].concat(args.slice(0, 1)).join(' ')
  console.log(logName, 'starting')
  return new Promise((resolve, reject) => {
    options = R.merge(options, { stdio: ['inherit', 'inherit', 'inherit'] })
    var c = childProcess.spawn(command, args, options)
      .on('error', reject)

    var wrapper = { process: c }

    wrapper.exitP = new Promise((resolve, reject) => {
      c.on('exit', (code, signal) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(logName + ': process crashed with code=' + code + ', signal=' + signal))
        }
      })
    })

    // node doesn't provide a "the process successfully spawned" event, so we
    // just have to wait a few ms to ensure it wont "error" with a ENOENT, etc.
    setTimeout(() => resolve(wrapper), 100)
  })

}

export function waitProcess(wrapper) {
  return wrapper.exitP
}
