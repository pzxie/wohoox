# wohoox

## 2.0.0-rc.7

### Patch Changes

- 9f0997c: wohoox-react useStore usage refactor

## 2.0.0-rc.6

### Minor Changes

- 2d56aa8: support state reset

## 2.0.0-rc.5

### Patch Changes

- change the way to get global variables

## 2.0.0-rc.4

### Patch Changes

- fix: spread iterator error

## 2.0.0-rc.3

### Patch Changes

- type define update

## 2.0.0-rc.2

### Patch Changes

- 3868c94: remove default export and update ts definition
- Updated dependencies [3868c94]
  - wohoox-utils@1.0.0-rc.2

## 2.0.0-rc.1

### Patch Changes

- fix ts declaration
- Updated dependencies
  - wohoox-utils@1.0.0-rc.1

## 2.0.0-rc.0

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

### Patch Changes

- Updated dependencies
  - wohoox-utils@1.0.0-rc.0
