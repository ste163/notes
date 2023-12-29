# notes

A minimal note-taking application for Linux, Mac, Windows, and browsers. Supports cloud syncing through [PouchDb](https://pouchdb.com/)

## TODOs

- Separate build process + deployment of browser-only version and desktop version
- Tauri version: supports auto-updates
- Dev workflow
  - on pre-commit, run type checker
  - on pre-commit, run eslint config + formatting
  - basic unit tests run on push + on PR
- PouchDb remote
  - make it work + update readme with work (separate repo for docker container?)

## Application Architecture

Goal: keep the application as simple to use and maintain as possible. Leverage existing technologies when possible and strictly vet each dependency.

Decisions for simplicity:

- Two main dependencies: PouchDb (cloud-enabled database) and TipTap (word processor)
- Pure Javascript instead of a UI framework. The application works as a light wrapper around TipTap to connect the database and writing editor states
- Using the [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) approach for global state across components

### Database Docker Container

PouchDb works locally using the browser's [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) and in the cloud using [CouchDb](https://couchdb.apache.org/). This repo contains instructions and a docker container for setting up a remote PouchDb instance.

(TODO) For portability, this repo contains a docker container for setting up a remote PouchDb with instructions

### Application structure and data-flow

```mermaid
flowchart TD
    subgraph Docker Container
      C[(PouchDb instance)]
    end
    subgraph Client-side - browser or tauri desktop application
      A[(local IndexedDB)]
      A -- Render editor with data from db --> B[TipTap Editor]
      B -- On save/delete event, store changes --> A
    end
  A -- Sync changes --> C
  C -- Sync changes --> A
```

## TODO ci/cd

On a PR commit/before push to main:

- run TypeScript type checker
- if it passes
- run all unit tests
- if it passes
- trigger test builds for the PR before merging
- if those pass
- then good to merge to main and trigger full release action

## Dev requirements

- (link to tuari requirements)
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

To interact with the CouchDB server and databases while running the container, go to: `http://localhost:5984/_utils/` to open the GUI. Username and password are located in `docker-compose.yml`

## updating packages

### pnpm

`pnpm i` from root

### Rust Cargo packages

```
cd src-tauri
cargo update
```

# credits: Remix Icons

(before releasing app, need to properly share the license)
https://remixicon.com/license
