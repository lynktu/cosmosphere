# Cosmosphere
Dependency graphs for Meteor packages

## NOTE
The client UI is currently unusable

## Usage:

1. git clone https://github.com/lynktu/cosmosphere.git
2. cd cosmosphere
3. meteor

It will then begin syncing the package data to a local mongo collection (may take a while). 
Only the versions collection is synced - it can be queried like this in `meteor shell`:
```
  Data.Versions.findOne()
```

## ToDo

- [ ] D3 Graphs
- [x] Connect & sync to [Package Server API](https://github.com/meteor/docs/blob/version-NEXT/long-form/package-server-api.md)
