# untitled-notes-app

> Tauri + Tiptap notes app

Tauri app with vanilla frontend and a simple tauri backend for reading and writing `.md` files using tiptap.

## App

- reads list of notes from fs
- can create note and write to fs
- can edit note
- can delete note

## Dev workflow

- app can check for auto-updates
- app can auto-update from a published github action
- on pre-commit, run type checker
- on pre-commit, run eslint config + formatting
- basic unit tests run on push + on PR?

## Architecture decisions

Decision for using vanilla html + js (TS) for the ui was to be as easily maintainable as possible. By leveraging TipTap and Tauri, the state management is directly based on the database for selecting and displaying the list of notes. Tiptap handles state once a note is selected.

(add a mermaid chart that explains architecture)

- PouchDb on browser and optional CouchDB running from a docker container with remote access for data backup and syncing across any amount of devices

## A better github action flow (if there were tests)

- on a PR commit/before push to main
- run TypeScript type checker
- if it passes
- run all unit tests
- if it passes
- trigger test builds for the PR before merging
- if those pass
- (ideally, we'd install the built app and run a suite of smoke tests on it)
- then good to merge to main and trigger full release action

## Dev requirements

- pnpm
- docker-compose

## getting up and running

todo: commands to get started

- required packages

### with docker db

info on couchdb w/ docker: https://github.com/apache/couchdb-docker

Running docker-compose.yml to run local db:

```
docker-compose up -d
```

To interact with the CouchDB server and databases while running the container, go to: `http://localhost:5984/_utils/` to open the GUI

## updating packages

PNPM
`pnpm i` from root

Rust Cargo packages

```
cd src-tauri
cargo update
```

# credits: Remix Icons

(before releasing app, need to properly share the license)
https://remixicon.com/license
