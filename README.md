# tbd-tauri-notes

Tauri app with vanilla frontend and a simple tauri backend for reading and writing `.md` files.

## Dev workflow (todo)

- auto build on merge
- auto publish once built
- app can check for auto-updates
- app can auto-update

## A better github action flow (if there were tests)

- run type script type checker
- run all unit tests
- if those pass
- trigger test builds for the PR before merging
- IF ALL THOSE PASS
- (ideally, we'd install the built app and run a suite of smoke tests on it)
- then good to merge to main and trigger build process
