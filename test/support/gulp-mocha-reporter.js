import Base from 'mocha/lib/reporters/base'

module.exports = function (runner) {
  Base.call(this, runner)

  var self = this

  runner.on('end', function () {
    if (self.failures.length === 0) {
      return
    }
    Base.list(self.failures)
  })
}
