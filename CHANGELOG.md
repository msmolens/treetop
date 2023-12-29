# Treetop Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added

- Add Google Chrome support.
- Add option to open Treetop in a new tab.
- Focus search input when pressing '/'.

### Changed

- Ignore bookmark separators, which aren't available on all browsers.
- Update Svelte to 4.2.8.
- Update Svelte Material UI to 7.0.0-beta16.
- Replace Jest with Vitest as the testing framework.
- Update development and testing dependencies.

## [1.7.0] - 2023-08-20

### Changed

- Remove usage of browser.contextMenus API events that don't exist in the
  chrome.contextMenus API.

## [1.6.0] - 2023-07-16

### Changed

- Remove dependency on bookmarks.BookmarkTreeNode.type field, which isn't
  available on all browsers.
- Remove dependency on hard-coded built-in bookmark folder IDs, which aren't the
  same across browsers.

### Removed

- Remove options to set visibility of built-in bookmark folders.

## [1.5.0] - 2022-09-27

### Changed

- Update Svelte Material UI to 6.1.4.
- Replace Rollup with Vite as the build tool.

### Fixed

- Fix selecting bookmark name or URL in properties dialog when focusing each input.

## [1.4.1] - 2022-06-20

### Fixed

- Fix color scheme when legacy 'system' option is stored.

## [1.4.0] - 2022-06-19

### Changed

- Update Svelte Material UI to 6.0.0-beta.16.
- Update development and testing dependencies.

### Removed

- Remove option to follow the system color scheme.

### Fixed

- Fix loading stored options.

## [1.3.0] - 2021-10-02

### Added

- Add webextension-polyfill.
- Pressing Escape clears the search input.

## [1.2.0] - 2021-09-18

### Added

- Add a search input to search for bookmarks by name or URL.

### Changed

- Update Svelte Material UI to 4.2.0.

## [1.1.3] - 2021-01-22

### Added

- List of attributions for open source software distributed in releases.

### Changed

- Use fonts from Fontsource packages.

## [1.1.2] - 2020-12-08

### Changed

- Fix visited bookmark styling.

## [1.1.1] - 2020-12-04

### Fixed

- Fix bad 1.1.0 release on addons.mozilla.org.

## [1.1.0] - 2020-12-04

### Changed

- Add option to change the color scheme.

## [1.0.1] - 2020-11-23

### Changed

- Improve timer that updates when bookmarks were last visited.

### Fixed

- Fix setting the document title.

## [1.0.0] - 2020-11-10

### Added

- Initial release.

[Unreleased]: https://github.com/msmolens/treetop/compare/v1.7.0...HEAD
[1.7.0]: https://github.com/msmolens/treetop/releases/tag/v1.7.0
[1.6.0]: https://github.com/msmolens/treetop/releases/tag/v1.6.0
[1.5.0]: https://github.com/msmolens/treetop/releases/tag/v1.5.0
[1.4.1]: https://github.com/msmolens/treetop/releases/tag/v1.4.1
[1.4.0]: https://github.com/msmolens/treetop/releases/tag/v1.4.0
[1.3.0]: https://github.com/msmolens/treetop/releases/tag/v1.3.0
[1.2.0]: https://github.com/msmolens/treetop/releases/tag/v1.2.0
[1.1.3]: https://github.com/msmolens/treetop/releases/tag/v1.1.3
[1.1.2]: https://github.com/msmolens/treetop/releases/tag/v1.1.2
[1.1.1]: https://github.com/msmolens/treetop/releases/tag/v1.1.1
[1.1.0]: https://github.com/msmolens/treetop/releases/tag/v1.1.0
[1.0.1]: https://github.com/msmolens/treetop/releases/tag/v1.0.1
[1.0.0]: https://github.com/msmolens/treetop/releases/tag/v1.0.0
