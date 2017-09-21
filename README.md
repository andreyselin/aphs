# aphs
Graphs for application development

Simple steps to install:
---------

1. Install with `npm install aphs --save-dev`

2. Update scripts of your package.json with following command: ` "aphs": "node node_modules/aphs/server.js" `

To make your first graph follow next steps:
---------

1. Run aphs with `npm run aphs`
2. Go to http://localhost:9029 - on first load it will set up default `aphs.json` in root folder and copy `aphs-usage-example.js` to your `src` path
3. Click `Open context` button and choose default context – you will see two blocks from copied `src/aphs-usage-example.js`. You can move them by the title, edit and update their files with them, but do not intersect or nest different blocks neither in client nor in code!
4. You can use code block wrappers ` /*-yourBlockName-*/ yourBlockCode /*-/yourBlockName-*/ ` in any file inside `src` directory. After setting up a new wrapper press `Update project blocks` button in the client to update aphs.json with it and to be able to use it in your contexts.
5. To use it click `Place block` button and chose it. It will be placed to context board.
6. To connect these blocks click `Add connection` button in the top menu, then click on connection source object, then on destination.
7. To edit or remove connection click on it.