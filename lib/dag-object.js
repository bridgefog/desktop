var immutable = require('immutable')

var DagLink = function (name, hash, size) {
  this.name = name || null
  this.hash = hash || null
  this.size = size || 0
}

DagLink.prototype.asJSONforAPI = function () {
  return {
    Name: this.name,
    Hash: this.hash,
    Size: this.size,
  }
}

var DagObject = immutable.Record({
  links: new immutable.Set(),
  data: null,
})

DagObject.DagLink = DagLink

DagObject.prototype.asJSONforAPI = function () {
  return {
    Links: this.links.toJS().map(function (l) {
      return l.asJSONforAPI()
    }),
    Data: this.data ? new Buffer(this.data).toString('base64') : '',
  }
}

DagObject.prototype.addLink = function (name, hash, size) {
  var link = new DagLink(name, hash, size)
  return this.set('links', this.links.add(link))
}

module.exports = DagObject
