var app = angular.module("app",[]);




app.controller("bodyController",["$scope", "context", function($scope, context){

    function calculateConnections (input){

    }

    $scope.show = {
        contextsList: false,
        board: false
    };

    $scope.data = {
        contextsList: [],
        context: null
    };

    $scope.showContextsList = function(){
        context.list().then(function(res){
            $scope.show.contextsList = true;
            $scope.data.contextsList = res.data.contexts;
        });
    };

    $scope.openContext = function(contextName){
        context.get(contextName).then(function(res){
            $scope.show.contextsList = false;
            $scope.data.context = res.data.context;
            $scope.show.board = true;
        });
    };


}]);




app.factory("context", ["$http", function($http) {

    return {
        list: function(){
            return $http.get("/listContexts");
        },
        get: function(contextName){
            return $http.get("/getContext/?name="+contextName);
        }
    };

}]);

app.directive("connectionDialog", ["$rootScope", function($rootScope){
    return {
        replace: false,
        restrict: "E",
        scope: {},
        templateUrl: 'connection-dialog.html',
        link: function (scope, element) {
            scope.$on("dialog.connection.show", function(event, connection){
                scope.connection = connection;
            });

            scope.hideDialog = function(){
                scope.connection = null;
                $rootScope.$broadcast("dialog.connection.hide");
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
            data: "="
        },
        template: '<div class="board_connection" ng-click="callDialog()" style="top:{{top}}px; left:{{left}}px; width:{{hypotenuse}}px; transform: rotateZ({{angle}}deg);"></div>',
        link: function(scope, element){

            scope.hypotenuse = 0;
            scope.angle = 0;
            scope.top = 0;
            scope.left = 0;

            function moveLine() {
                var fromX = scope.from.left + scope.from.width;
                var fromY = scope.from.top  + scope.data.from.line * 16 + 8 + 4; // 4 is for border and padding
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
            }, 10);


            scope.$on("block.moving.on", function(event, args) {
                var watchers;
                if (
                    args.blockKey === scope.data.from.block
                    ||
                    args.blockKey === scope.data.to.block
                ){
                    console.log("11");
                    watchers= scope.$watchGroup([
                        "from.left","from.top","from.width","from.height",
                        "to.left","to.top","to.width","to.height"
                    ], function(){ moveLine(); });
                    scope.$on("block.moving.off", function(event) {
                        watchers();
                    });
                } else {
                    console.log("22");
                }
            });

            scope.callDialog = function() {
                $rootScope.$broadcast("dialog.connection.show", scope.data);
                console.log("data",scope.data);
                var watchers = scope.$watchGroup([
                    "data.from.block", "data.from.line",
                    "data.to.block", "data.to.line"
                ],function(){
                    moveLine();
                })
                scope.$on("dialog.connection.hide", function(){
                    watchers();
                });
            }

        }
    };
}]);


app.directive("boardBlock", ["$rootScope", function($rootScope){

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
            var textarea = element[0].children[1];
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
                        width: longest * 7.5,
                        height: (array.length+1) * 16
                    };
                }

                var newBounds = getBounds(scope.content);

                scope.data.width = newBounds.width;
                scope.data.height = newBounds.height;
                textarea.style.width = scope.data.width + 'px';
                textarea.style.height = '1px';
                textarea.style.height = scope.data.height + 'px';

            }

            var header = element[0].children[0];
            header.onmousedown = function(eventDown){
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

            scope.expandTextarea();
            scope.$watch("content", function(){
                scope.expandTextarea();
            });

        }
    };
}]);