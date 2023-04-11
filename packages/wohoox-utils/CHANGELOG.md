# wohoox-utils

## 1.0.0-rc.1

### Patch Changes

- fix ts declaration

## 1.0.0-rc.0

### Major Changes

- - Split wohoox to wohoox, wohoox-react, wohoox-utils
  - Add test cases for wohoo and wohoox-react
  - Add docs

  - Key caches management move to wohoox-react, wohoox will be light more
  - Callbacks params for keys changed to array

  - effect list split to add, delete, set

  - Array length settled callback not be triggered when array items added by manually
  - Plugin onChange type define error
  - Fix method of forEach not proxied for map proxy and set proxy

  - Add changeset to manage version
