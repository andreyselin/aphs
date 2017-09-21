# aphs
Graphs for application development

##Simple steps to install:
---------

1. Install with `npm install aphs`

2. Update scripts of your package.json with following command: ` "aphs": "node node_modules/aphs/server.js" `

##To make your first graph follow next steps:
---------

1. Run aphs with `npm run aphs`

2. Wrap code blocks you want to visualize with marks ` /*-yourBlockName-*/ yourBlockCode /*-/yourBlockName-*/ ` Note: these blocks should be in files inside `src` directory!

3. Go to http://localhost:9029 in your browser. Aphs was made with Chrome and not tested with other browsers.
4. Click Open context button and choose default.
5. Click Place block button, choose one of the blocks you marked up in step 2, then place another one. Now you can edit block contents from here and save it to file.
6. To connect these blocks click Connect button at first of them, then click the block you want to set connection to.
7. To edit or remove connection click on it.