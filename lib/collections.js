Data = {};

Data.depsTransform = function (doc) {
  var a = [];

  for (var key in doc.dependencies) {
    var dep = doc.dependencies[key];

    dep.packageName = key;

    a.push(dep);
  }

  doc.dependencies = a;

  return doc;
}

Data.Versions = new Mongo.Collection('versions');
Data.SyncTokens = new Mongo.Collection('sync-tokens');
