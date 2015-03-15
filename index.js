'use strict';

var http = require('http');
var FormData = require('form-data');

// function getObject(key, cb) {
//     ipfs.object.get(key, function (error, response) {
//         console.log("object/get", error, response);
//         if (error) {
//             process.exit(1);
//         }
//         cb(response);
//     });
// }

function DagNode(links, data) {
  this.links = links;
  if (!links) {
    this.links = [];
  }
  this.data = data;
  if (!data) {
    this.data = '';
  }
}
DagNode.prototype.asJSONforAPI = function() {
    var data_enc = new Buffer(this.data).toString('base64'),
        dag_object = {
            Links: this.links,
            Data: data_enc,
        };

    return new Buffer(JSON.stringify(dag_object));
};

function dagLeaf(data) {
  return new DagNode(null, data);
}

// function getCurrentPublishedName(cb) {
//
//     ipfs.name.resolve(null, function (error, response) {
//         console.log("name/resolve", error, response);
//         if (error) {
//             process.exit(1);
//         }
//         cb(response.Key);
//     });
// }

// addMetadataObject(1, function (key) {
//     getObject(key, function (obj) {
//         console.log(obj);
//     });
// });

// getCurrentPublishedName(function (key) {
//     getObject(key, function (obj) {
//         console.log(obj);
//     });
// });

exports.DagNode = DagNode;

exports.addObject = function (dagNode, cb) {
    var formdata = new FormData();
    formdata.append('data', dagNode.asJSONforAPI(), {
        filename: '_',
        contentType: 'application/json'
    });

    var req = http.request({
        hostname: 'localhost',
        port: 5001,
        path: '/api/v0/object/put?arg=json',
        method: 'POST',
        headers: formdata.getHeaders()
    });
    req.on('response', function (res) {
        var responseBody = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            responseBody += chunk;
        });

        res.on('end', function () {
            var obj = JSON.parse(responseBody);
            if (res.statusCode !== 200) {
                cb(obj, null);
            } else {
                cb(null, obj);
            }
        });
    });

    req.on('error', function (e) {
        cb(e, null);
    });

    formdata.pipe(req);
    req.end();
};
