App.PackageServer = DDP.connect(App.packageServerUrl);
App.syncCount = 0;
App.logEnabled = true;

function syncVersions (syncToken) {
  App.syncCount += 1;

  let result = App.PackageServer.call("syncNewPackageData", syncToken);
  let n = 0;
  syncToken = result.syncToken;

  if (result.resetData) {
    console.log('[Cosmosphere] Resetting data...');
    Data.Versions.remove({});
    syncVersions(result.syncToken);
    return;
  }

  // Update
  for (var v of result.collections.versions) {
    v = Data.depsTransform(v);
    n += Data.Versions.upsert(v._id, v).numberAffected;
  }

  if (App.logEnabled) {
    console.log('[Cosmposphere] Syncing: -cycle#' + App.syncCount, '- with token: ', syncToken, ' ', n, ' records updated.' );
  }


  if (! result.upToDate) {
    // Continue syncing with new token
    Meteor.setTimeout(function () {
      syncVersions(result.syncToken);
    }, 2000);
  } else {
    // Store updated syncToken
    Data.SyncTokens.upsert(syncToken._id, syncToken);
    console.log('[Cosmosphere] Syncing finished. Versions are up-to-date.');
  }
}

/*PackageServer = MeteorPackages;

Meteor.startup(function () {
  PackageServer.startSyncing();
});*/

Data.Defaults = new Mongo.Collection('defaults', App.PackageServer);

// Subscribe to 'defaults' collection to get data
App.PackageServer.subscribe('defaults', function () {
  if (Data.SyncTokens.findOne()) {
    App.defaultToken = Data.SyncTokens.findOne();
    // PServer method doesn't accept _id field
    delete App.defaultToken._id;
  } else {
    // Get default token
    App.defaultToken = Data.Defaults.findOne().syncToken;
  }

  // Begin syncing
  syncVersions(App.defaultToken);
});
