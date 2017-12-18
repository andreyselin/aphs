console.log("     *|---APHS---|*");



const path = require('path');
const projectPath = path.resolve(__dirname,'../../');
const JSONPath = path.resolve(__dirname,'../../aphs.json');
const defaultJSONPath = path.resolve(__dirname,'./default-aphs.json');
const srcPath = projectPath+"/src";

// example file copying source and destination in src folder
const exampleSrcPath  = path.resolve(__dirname,'./aphs-usage-example.js');
const exampleDestPath = srcPath+'/aphs-usage-example.js';
const fs = require('fs');
const fse = require('fs-extra');



var searchFilesDeeply = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    searchFilesDeeply(file, function(err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file.split(srcPath)[1]);
                    next();
                }
            });
        })();
    });
};



function checkAphsInitiated() {
    if (!fs.existsSync(JSONPath)) {
        fse.copySync(defaultJSONPath, JSONPath);
        fse.copySync(exampleSrcPath, exampleDestPath); // optional, for help
    }
}

function getJSON() {
    checkAphsInitiated();
    return JSON.parse(fs.readFileSync(JSONPath, 'utf8'));
}



function saveJSON(json) {
    fs.writeFileSync(JSONPath, JSON.stringify(json), "utf8");
}



function updateProjectBlocks(){
    var json = getJSON();
    getBlocks(function(theBlocks){
        json.blocks = theBlocks;
        saveJSON(json);
    });
}




function parseFile(filename) {
    var code = fs.readFileSync(srcPath+filename, "utf8");
    var regExp = new RegExp(/\/\*-(.+?)-\*\//, 'gim');
    var array = code.match(regExp);
    var toReturn = [];
    if (array !== null) {
        array.forEach(function(clip, index, array) {
            var closer ="/*-/" + clip.substring(3, clip.length);
            if (array.indexOf(closer, index + 1) !== -1) {
                toReturn.push({
                    name: clip.substring(3, clip.length-3),
                    filename: filename
                });
            }
        });
    }
    return toReturn;
}




// Callback just because it will take long
// to make searchFilesDeeply sync (now async)
function getBlocks(callback) {
    var blocks = [];

    /*
    fs.readdirSync(srcPath).forEach(function(filename){

        // correct later to work
        // on different folder levels
        // with recursive search like here:
        // https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
        // >
        if (!fs.lstatSync(srcPath+"/"+filename).isDirectory()){
            blocks = blocks.concat(parseFile(filename));
        }
    });
    */

    searchFilesDeeply(srcPath, function(error, paths){
        paths.forEach(function(path){
            blocks = blocks.concat(parseFile(path));
        });
        callback (blocks);
    });

    // return blocks;
}




function getBlockContent(blockName) {
    var code = getFileContent.byBlockName(blockName);
    if (!code) {
        // If cannot find file
        console.log("Can not find file with block "+blockName);
        return null;
    } else {
        if (
            code.indexOf("/*-"+blockName+"-*/") !== -1
            &&
            code.indexOf("/*-/"+blockName+"-*/") !== -1
        ){
            return code.split("/*-"+blockName+"-*/")[1].split("/*-/"+blockName+"-*/")[0];
        } else {
            // If there is no marks in file
            console.log ("Block is not closed: "+blockName);
            return null;
        }
    }
}




function saveBlockContent(blockName, newBlockContent) {
    var code = getFileContent.byBlockName(blockName);
    var array1 = code.split("/*-"+blockName+"-*/");
    var array2 = array1[1].split("/*-/"+blockName+"-*/");
    var updatedCode = array1[0] + "/*-"+blockName+"-*/" + newBlockContent + "/*-/"+blockName+"-*/" + array2[1];

    var filename = getBlockFilename(blockName);
    fs.writeFileSync(srcPath+filename, updatedCode, "utf8");
}



function getBlockFilename (blockName){
    var json = getJSON();
    for (block of json.blocks) {
        if(block.name === blockName) {
            return block.filename;
        }
    }
    return null;
}



var getFileContent = {
    byBlockName: function(blockName) {
        var filePath = srcPath+getBlockFilename(blockName);
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, "utf8");
    }
};



        ////////////////
        //            //
        //   Export   //
        //            //
        ////////////////



module.exports = {
    checkAphsInitiated:checkAphsInitiated,
    updateProjectBlocks:updateProjectBlocks,
    saveBlockContent:saveBlockContent,
    getBlocks:getBlocks,
    getBlockContent:getBlockContent,
    parseFile:parseFile,
    getJSON:getJSON,
    saveJSON:saveJSON
};