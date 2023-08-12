# untitled-notes-app

> Tauri + Tiptap notes app

Tauri app with vanilla frontend and a simple tauri backend for reading and writing `.md` files using tiptap.

## App

- reads list of notes from fs
- can create note and write to fs
- can edit note
- can delete note

## Dev workflow (2/4 completed)

- DONE: test build on PR push
- DONE: auto publish once built
- app can check for auto-updates
- app can auto-update from a published github action
- on pre-commit, run type checker
- on pre-commit, run eslint config + formatting
- basic unit tests?

## Architecture decisions

Decision for using vanilla html + js (TS) for the ui was to be as easily maintainable as possible. By leveraging TipTap and Tauri, the state management is directly based on the filesystem for selecting and displaying the list of notes. Tiptap handles state once a note is selected, so having any more

(potentially add a mermaid chart that explains how this flow works)

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

## getting up and running

todo: commands to get started

- required packages
-

## updating packages

NPM
`npm i` from root

Rust Cargo packages

```
cd src-tauri
cargo update
```

# credits: Remix Icons

(before releasing app, need to properly share the license)
https://remixicon.com/license
