import childProcess from 'child_process'

export default function (filename) {
  return new Promise((resolve, reject) => {
    var output = ''
    var proc = childProcess.spawn('fpcalc', [filename], { stdio: ['ignore', 'pipe', 'ignore'] })
    proc.stdout.on('data', data => output += data.toString())
    proc.on('exit', code => {
      if (code === 0) {
        resolve(output.trim())
      } else {
        reject(new Error('fpcalc exited ' + code))
      }
    })
  }).then(parse)
}

function parse(outputString) {
  var out = {}
  outputString.split('\n').forEach(line => {
    var [key, val] = line.split('=')
    switch (key) {
      case 'FINGERPRINT': {
        out.fingerprint = val
        break
      }
      case 'DURATION': {
        out.duration = parseInt(val)
        break
      }
    }
  })
  return out
}
