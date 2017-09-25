var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var aphs = require("./aphs");
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




        ///////////////////
        //               //
        //   Front-end   //
        //               //
        ///////////////////




app.get('/', function(req,res){
    aphs.checkAphsInitiated();
    res.sendFile(path.resolve(__dirname,'./frontend/index.html'));
});

app.get('/board-block.html',          function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/board-block.html')); });
app.get('/connection-dialog.html',    function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/connection-dialog.html')); });
app.get('/message-dialog.html',       function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/message-dialog.html')); });
app.get('/contexts-list-dialog.html', function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/contexts-list-dialog.html')); });
app.get('/blocks-list-dialog.html',   function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/blocks-list-dialog.html')); });
app.get('/style.css',                 function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/style.css')); });
app.get('/script.js',                 function(req,res){ res.sendFile(path.resolve(__dirname,'./frontend/script.js')); });




        ///////////////////
        //               //
        //      API      //
        //               //
        ///////////////////





app.get("/updateProjectBlocks", function(req, res) {
    aphs.updateProjectBlocks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
});






app.get("/listContexts", function(req, res) {
    var json = aphs.getJSON();
    var list = json.contexts.map(function(context){
        return {
            "name":context.name,
            title: context.title
        }
    });
    var responseBody = {list:list};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(responseBody));
    res.end();
});






app.get("/getContext", function(req, res) {

    var contextName = req.query.name;
    var json = aphs.getJSON();

    var responseBody = {
        context: {
            name:"",
            blocks: {},
            connections: {},
            contents: {}
        }
    };

    for(var context of json.contexts) {
        if(context.name === contextName) {
            responseBody.context = context;
        }
    }


    // getting block contents
    responseBody.context.blocks.forEach(function(block){
        responseBody.context.contents[block.name] = aphs.getBlockContent(block.name);
    });



    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(responseBody));
    res.end();
});






app.get("/getBlockContent", function(req, res) {
    var blockName = req.query.blockName;
    var responseBody = {content:aphs.getBlockContent(blockName)};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(responseBody));
    res.end();
});






app.post("/saveBlockContent", function(req, res) {

    var block = req.body.blockToSave;

    aphs.saveBlockContent(block.name, block.content);

    var responseBody = {status:0};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(responseBody));
    res.end();
});






app.get("/listBlocks", function(req, res) {
    var json = aphs.getJSON();
    var list = json.blocks.map(function(block){ return block.name; });
    var responseBody = {list:list};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(responseBody));
    res.end();
});







app.post("/saveContext", function(req, res) {
    var contextToSave = req.body.context;
    contextToSave.contents = {}; // adding empty contents
    var json = aphs.getJSON();

    var updated = false;
    for (var i=0; i<json.contexts.length; i++) {
        if(json.contexts[i].name === contextToSave.name){
            json.contexts[i] = contextToSave;
            updated = true;
            break;
        }
    }
    if (!updated) {
        json.contexts.push(contextToSave);
    }

    aphs.saveJSON(json);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
});







var server = app.listen(9029, function () {
    console.log("Listening on port %s...", server.address().port);
});