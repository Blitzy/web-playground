# Web Playground - Changelog

## v0.1.4 - TBD

### Changes

- Got standard shader derived terrain shader working with splatting.
- Fixed light color/intensity value bugs in olympia realtime light test.
- Added new sandbox `canvas-image-resize` to test out how canvas can be used to resize images within the browser.

## v0.1.3 - Feb 18, 2021

### Changes

- Added setting presets to olympia-realtime-light-test: `Interior Workshop` and `Exterior Map`.

## v0.1.2 - Feb 17, 2021

### Changes

- Upgraded three from r116 to r125.
- Upgraded draco decoder library.
- Started using dat.gui for controls. Converted olympia-lightmap-test buttons/toggles to dat.gui.
- Created dat.gui.utils file for extender helper functions related to dat.gui.
  - `addVector3`
  - `addEuler`
- Added cascaded shadow mapping and placeholder cube buildings to olympia realtime light test.
- Adjusted lighting settings into olympia realtime light test.
  
## v0.1.1 - Feb 15, 2021

### Changes

- Added ability to press back to access the sandbox menu if the page was loaded directly into a sandbox using the `?sandbox` url paremeter.

## v0.1.0 - Feb 15, 2021

### Changes

- Initial version.
- Sandboxes includes:
  - **orbit-box**: Simple three.js scene with red box and orbit camera controls.
  - **olympia-lightmap-test**: three.js scene with various versions of the same building model showing off three.js lightmaps, env maps, ao maps, etc.