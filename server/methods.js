Meteor.methods({
  'getDependencies': function (packageName) {
    if (packageName) {
      var p = Data.Versions.findOne({packageName});

      var data = {};

      data.packageName = p.packageName;
      data.version = p.version;
      data.dependencies = p.dependencies;

      return data;
    } else {
      return Data.Versions.findOne();
    }
  },
  getDependenciesTree: function (packageName) {
    // recursive
    var createBranches = function (name, lastName) {
      var branch = {};

      var p = Data.Versions.findOne({packageName: name});

      if (!p) {
        // Just return if no package is found, since local deps are a thing
        return;
      }

      //console.log('[getDependenciesTree] Package: ', p.packageName, ' deps: ', p.dependencies);

      for (var dep of p.dependencies) {
        //console.log('Creating branch for dep: ', dep);

        branch[dep.packageName] = {};

        branch[dep.packageName].contraint = dep.contraint;

        branch[dep.packageName].references = dep.references;

        if (dep.packageName === lastName) {
          branch[dep.packageName].dependencies = createBranches(dep.packageName, name);
        } else {
          branch[dep.packageName].dependencies = '[Omitted circular dependency]'
        }
      }

      return branch;
    }

    return createBranches(packageName);
  }
});

/*

1. {}
2. {autoupdate: {}}
3. {autoupdate: {meteor: {contraint: '', ref: '', dependencies: {}}}}

*/
