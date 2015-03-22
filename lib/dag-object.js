var immutable = require('immutable')

var DagObject = immutable.Record({
  links: new immutable.Set(),
  data: null
})

DagObject.prototype.asJSONforAPI = function () {
  var dag_object = {
    Links: this.links.toJS(),
    Data: this.data ? new Buffer(this.data).toString('base64') : '',
  }

  return new Buffer(JSON.stringify(dag_object))
}

DagObject.prototype.addLink = function (name, hash) {
  return this.set('links', this.links.add({
    name: name,
    hash: hash
  }))
}

module.exports = DagObject
