var ipfs_api = require('ipfs-api');
var ipfs = ipfs_api('localhost', 5001);

var metadata = {
  title: "song 2",
  artist: "blur",
};

function addMetadataObject(obj, cb){
  var dag_object = {
    Links: [],
    Data: new Buffer(JSON.stringify(obj)).toString('base64'),
    Data: "\b\u0001",
  };

  var dag_object_buf = new Buffer(JSON.stringify(dag_object));
  console.log(dag_object_buf.toString('ascii'))

  ipfs.object.put(dag_object_buf, 'json', function(error, response){
    console.log("object/put", error, response);
    if (error) { process.exit(1) }
    cb(response.Key);
  });
}

addMetadataObject(metadata, function(key){
  getObject(key);
  // console.log(object);
});

function getCurrentPublishedName(cb) {
  ipfs.name.resolve(null, function(error, response){
    console.log("name/resolve", error, response)
    if (error) { process.exit(1) }
    cb(response.Key)
  });
}

function getObject(key) {
  ipfs.object.get(key, function(error, response){
    console.log("object/get", error, response);
    if (error) { process.exit(1); }
    // cb(response)
  });
}

getCurrentPublishedName(function(key){
  getObject(key);
});

getObject("QmV9E5oNhFDWeRV8NQ91G7vp3pvff2S4UYkn89T5koSzqo");
