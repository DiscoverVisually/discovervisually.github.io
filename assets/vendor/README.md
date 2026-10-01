# Living Shelf renderer

`three-r186.js` is a minified, tree-shaken ES module from the official
`three@0.186.1` npm package, including its RoundedBoxGeometry and RoomEnvironment
add-ons. Its MIT license is included in `three-LICENSE.txt`.

Only the catalogue page loads this dependency, dynamically. All imports are
local; the production website requires no package installation or build step.
The source renderer is `../shelf-scene.js`, with pure layout in
`../shelf-layout.js`. The renderer uses original cover artwork and estimated
thin paperback bindings. It does not claim to reproduce unavailable back covers.
