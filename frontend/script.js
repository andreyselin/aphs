var app = angular.module("app",[]);




app.controller("bodyController",["$scope", "context", "$rootScope", function($scope, context, $rootScope){

    $scope.context = null;

    // This should be moved to particular menu controller
    $scope.showContextsList = function(){
        $rootScope.$broadcast("dialogs.contextsList.show");
    };

    $scope.$on("context.show", function(event){
        $scope.context = context;
    })

    $scope.saveContext = function() {
        context.act.save();
    }

    $scope.showBlocksList = function(){
        $rootScope.$broadcast("dialogs.blocksList.show");
    }

    $scope.addConnection = function(){
        $rootScope.$broadcast("connection.add", context.act.createConnection());
    }

}]);

app.factory("context", ["$rootScope", "$http", "$q", function($rootScope, $http, $q) {

    $rootScope.$on("connection.add", function(event, newConnection) {
        if(newConnection.from.block !== null && newConnection.to.block !== null){
            toReturn.connections.push(newConnection);
        }
    });

    var toReturn = {
        list: null,
        name: null,
        blocks:[],
        connections:[],
        contents:{},
        act: {
            createConnection: function(){
                return {
                    from: {block:null, line:null},
                    to:   {block:null, line:null}
                }
            },
            list: function(){
                var deferred = $q.defer();
                $http.get("/listContexts").then(function(res) {
                    toReturn.list = res.data.list;
                    deferred.resolve(res);
                });
                return deferred.promise;
            },
            get: function(contextName){
                var deferred = $q.defer();
                $http.get("/getContext/?name="+contextName).then(function(res) {
                    var context = res.data.context;
                    toReturn.name =        context.name;
                    toReturn.blocks =      context.blocks;
                    toReturn.connections = context.connections;
                    toReturn.contents =    context.contents;
                    deferred.resolve(res);
                });
                return deferred.promise;
            },
            save: function() {
                var deferred = $q.defer();
                $http.post("/saveContext", {
                    context: {
                        name:        toReturn.name,
                        blocks:      toReturn.blocks,
                        connections: toReturn.connections,
                        // contents: {} // this is added at serverside
                    }
                }).then(function(res) {
                    deferred.resolve(res);
                });
                return deferred.promise;
            },
            addBlock: function(blockName){

                function doAddBlock(content) {
                    var newBlock = {
                        name:blockName,
                        width:300,
                        height:200,
                        left:200,
                        top:200
                    }
                    toReturn.blocks.push(newBlock);
                    deferred.resolve(newBlock);
                }

                var deferred = $q.defer();

                if (toReturn.contents[blockName]){
                    doAddBlock();
                } else {

                    $http.get("/getBlockContent").then(function(res) {
                        toReturn.contents[blockName] = res.data.content;
                        doAddBlock();
                    });

                }
                return deferred.promise;
            },
            saveBlockContent: function(name, content) {
                var deferred = $q.defer();
                $http.post("/saveBlockContent", {
                    blockToSave: {
                        name:    name,
                        content: toReturn.contents[name]
                    }
                }).then(function(res) {
                    deferred.resolve(res);
                });
                return deferred.promise;
            },
            removeBlock: function(key) {
                toReturn.blocks.splice(key, 1);

                var oldConnections = angular.copy(toReturn.connections);
                oldConnections.forEach(function(connection, connectionKey){
                    [connection.from, connection.to].forEach(function(connectionBlock) {

                        if (connectionBlock.block === key){
                            oldConnections[connectionKey] = null;
                        } else {
                            if (connectionBlock.block > key) {
                                connectionBlock.block -= 1;
                            }
                        }

                    });

                });
                var newConnections = [];
                oldConnections.forEach(function(connection){
                    if (connection !== null){
                        newConnections.push(connection);
                    }
                });
                toReturn.connections = newConnections;
            }
        }
    };
    return toReturn;
}]);

app.factory("blocks", ["$http", "$q", function($http, $q) {
    var blocks = {
        list: [],
        act: {
            list: function(){
                var deferred = $q.defer();
                $http.get("/listBlocks").then(function(res) {
                    blocks.list = res.data.list;
                    deferred.resolve(res);
                });
                return deferred.promise;
            }
        }
    };
    return blocks;

}]);

app.directive("connectionDialog", ["$rootScope", "context", function($rootScope, context) {
    return {
        replace: false,
        restrict: "E",
        scope: {},
        templateUrl: 'connection-dialog.html',
        link: function (scope, element) {

            scope.context = context;

            scope.$on("dialogs.connection.show", function(event, key, x, y){
                scope.key = key;
                scope.x = x;
                scope.y = y;
                scope.connection = scope.context.connections[scope.key];
            });

            scope.hideDialog = function(){
                scope.connection = null;
                $rootScope.$broadcast("dialogs.connection.hide");
            }

            scope.removeConnection = function(){
                scope.context.connections.splice(scope.key, 1);
                scope.hideDialog();
            }
        }
    };
}]);

app.directive("contextsListDialog", ["$rootScope", "context", function($rootScope, context){
    return {
        replace: false,
        restrict: "E",
        scope: {},
        templateUrl: 'contexts-list-dialog.html',
        link: function (scope, element) {
            scope.list = null;
            scope.$on("dialogs.contextsList.show", function(event) {
                context.act.list().then(function(res){
                    scope.list = context.list;
                });
            });
            scope.openContext = function(contextName){
                context.act.get(contextName).then(function(res){
                    scope.hideDialog();
                    $rootScope.$broadcast("context.show");
                });
            };
            scope.hideDialog = function(){
                scope.list = null;
            }
        }
    };
}]);

app.directive("blocksListDialog", ["$rootScope", "context", "blocks", function($rootScope, context, blocks){
    return {
        replace: false,
        restrict: "E",
        scope: {},
        templateUrl: 'blocks-list-dialog.html',
        link: function (scope, element) {
            scope.list = null;
            scope.$on("dialogs.blocksList.show", function(event) {
                blocks.act.list().then(function(res){
                    scope.list = blocks.list;
                });
            });
            scope.addBlock = function(blockName) {
                context.act.addBlock(blockName);
                scope.hideDialog();
            }
            scope.hideDialog = function(){
                scope.list = null;
            }
        }
    };
}]);

app.directive("boardConnection", ["$rootScope", "$timeout", function($rootScope, $timeout){

    return {
        replace:true,
        restrict:"E",
        scope: {
            from: "=",
            to: "=",
            data: "=",
            key: "="
        },
        template: '<div class="board_connection" ng-click="callDialog()" style="top:{{top}}px; left:{{left}}px; width:{{hypotenuse}}px; transform: rotateZ({{angle}}deg);"></div>',
        link: function(scope, element){

            scope.hypotenuse = 0;
            scope.angle = 0;
            scope.top = 0;
            scope.left = 0;

            function moveLine() {
                var fromX = scope.from.left + scope.from.width;
                var fromY = scope.from.top  + scope.data.from.line * 16 + 8 + 4; // 4 is for border and padding, 8 is for half of the line
                var toX = scope.to.left;
                var toY = scope.to.top  + scope.to.height / 2;

                var catheterX, catheterY = 0;
                var sideA, sideB, sideC = 0;
                var heightOfTriangle;
                var offsetToLeft;
                catheterX = fromX - toX;
                catheterY = fromY - toY;
                scope.hypotenuse = Math.sqrt(catheterX*catheterX + catheterY*catheterY);
                if ( catheterX >= 0) {
                    scope.angle = Math.atan(1/(catheterX/catheterY)) * (180/Math.PI) + 180;
                } else {
                    scope.angle = Math.atan(1/(catheterX/catheterY)) * (180/Math.PI);
                }
                sideA = sideB = scope.hypotenuse/2;
                sideC = 2 * sideA * Math.sin(scope.angle/2 * Math.PI / 180);

                heightOfTriangle = sideB * Math.sin(scope.angle * Math.PI / 180);
                offsetToLeft = Math.sqrt(sideC*sideC - heightOfTriangle*heightOfTriangle);

                scope.top  = fromY + heightOfTriangle;
                scope.left = fromX - offsetToLeft;
            }

            // For some reasons connections renders earlier that blocks
            // though they are after in the code and width and height of the blocks
            // is not considered - will be no problem when width and height will be saved as well as top and left
            $timeout(function(){
                moveLine();
            }, 50);


            scope.$on("block.moving.on", function(event, args) {
                var watchers;
                if (
                    args.blockKey === scope.data.from.block
                    ||
                    args.blockKey === scope.data.to.block
                ){
                    watchers= scope.$watchGroup([
                        "from.left","from.top","from.width","from.height",
                        "to.left","to.top","to.width","to.height"
                    ], function(){ moveLine(); });
                    scope.$on("block.moving.off", function(event) {
                        watchers();
                    });
                }
            });

            scope.callDialog = function() {
                $rootScope.$broadcast("dialogs.connection.show", scope.key, scope.left+70, scope.top+40);
                var watchers = scope.$watchGroup([
                    "data.from.block", "data.from.line",
                    "data.to.block",   "data.to.line"
                ],function(){
                    moveLine();
                })
                scope.$on("dialogs.connection.hide", function(){
                    watchers();
                });
            }

        }
    };
}]);

app.directive("boardBlock", ["$rootScope", "$timeout", "context", function($rootScope, $timeout, context){

    return {
        replace:true,
        restrict:"E",
        scope: {
            key: "=",
            data: "=",
            content: "="
        },
        templateUrl: './board-block.html',
        link: function(scope, element){



            scope.$on("connection.add", function(event, newConnection) {
                scope.connectionStep = null;
                if(newConnection.to.block === null){
                    scope.connectionStep = "to"
                }
                if(newConnection.from.block === null){
                    scope.connectionStep = "from"
                }
                if(newConnection.from.block !== null && newConnection.to.block !== null){
                    scope.connectionStep = null;
                }

                scope.addConnection = function() {
                    newConnection[scope.connectionStep].block = scope.key;
                    $rootScope.$broadcast("connection.add", newConnection);
                }
            });



            var textarea = element[0].children[2];
            scope.expandTextarea= function() {

                function getBounds(text) {
                    var longest = 20;
                    var regExp = /\n|$/gmi;
                    var array = text.split(regExp);
                    array.forEach(function(string) {
                        if (string.length > longest) {
                            longest = string.length + 1;
                        }
                    });
                    return {
                        width: longest * 9.5,
                        height: (array.length+1) * 16
                    };
                }

                var newBounds = getBounds(scope.content);

                scope.data.width = newBounds.width;
                scope.data.height = newBounds.height;
                textarea.style.width = scope.data.width;
                textarea.style.height= scope.data.height;

            }

            var header = element[0].children[1];
            header.onmousedown = function(eventDown) {
                $rootScope.$broadcast("block.moving.on", {blockKey: scope.key});

                document.onmousemove = function (event) {
                    scope.$apply(function(){
                        scope.data.left = event.clientX;
                        scope.data.top  = event.clientY;
                    });
                }
                document.onmouseup = function() {
                    scope.$apply(function(){
                        $rootScope.$broadcast("block.moving.off");
                        document.onmousemove = null;
                        document.onmouseup = null;
                    });
                }
            }

            scope.saveBlockContent = function() {
                context.act.saveBlockContent(scope.data.name).then(function(){
                    scope.contentIsChanged = false;
                });
            }

            scope.removeBlock = function() {
                context.act.removeBlock(scope.key);
            }


            // If block has content
            // (marks exist in file)
            // expand textarea
            if(scope.content !== null) {(function(){
                var watcherInitiated = false;
                scope.onFocus = function() {
                    textareaWatcher = scope.$watch("content", function(newValue, oldValue){
                        if(newValue !== oldValue) {
                            scope.contentIsChanged = true;
                            scope.expandTextarea();
                        }
                    });
                }
                scope.onBlur = function() {
                    textareaWatcher();
                }
                scope.expandTextarea();
            })()}


        }
    };
}]);