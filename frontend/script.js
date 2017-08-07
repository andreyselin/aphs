var app = angular.module("app",[]);




app.controller("bodyController",["$scope", "context", function($scope, context){

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


app.directive("boardBlock", function(){

    return {
        restrict:"E",
        scope: {
            data: "=",
            content: "="
        },
        templateUrl: './board-block.html',
        link: function(scope){
            console.log("-=!=-", scope.data);
        }
    };
});