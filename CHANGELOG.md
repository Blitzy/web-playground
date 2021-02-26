# Web Playground - Changelog

## v0.1.6 - Feb 26, 2021

### Changes

- Terrain deformation in `olympia-realtime-light-test` is now done once via height map at geometry creation time instead of displacement map in the shader.
- Added `CSMHelper` to `olympia-realtime-light-test` to visualize cascaded shadow mapping breaks.
- Added ability to modify breaks using `custom` split setting in `olympia-realtime-light-test`.
- Added `mesh-performance` sandbox for testing raw geometry rendering performance for ~4 million triangles using different materials.

## v0.1.5 - Feb 20, 2021

- Using dynamic imports to allow rollup to split sandbox bundles away from main bundle.
- Revert `rollup-plugin-generate-html-template` back to 1.6.1 to resolve issue causing split bundles to be included in `index.html`.
- Switch to using yarn package manager.
- Changed local `http-server` to using cache control value of `max-age=86400` when testing locally.

## v0.1.4 - Feb 19, 2021

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