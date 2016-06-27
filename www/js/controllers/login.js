angular.module('login.controller', []).controller('LoginCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $scope.data = {password:"admin",username:"admin"};
  $scope.login = function() {
    console.log($scope.data)
    if ($scope.data.username === "admin" && $scope.data.password === "admin") {
      $rootScope.user = {
        validated: true,
        cameras: [{
          name: "Dahua Stream Example",
          type: "Dahua",
          ip: "http://82.176.144.239:7070",
          user: "admin",
          pass: "admin"
        }, {
          name: "Axis Stream Example",
          type: "Axis",
          ip: "http://82.176.158.74:1010",
          user: "root",
          pass: "toor321"
        }, {
          name: "Axis Stream Example 2 [Same ip]",
          type: "Axis",
          ip: "http://82.176.158.74:1010",
          user: "root",
          pass: "toor321"
        }, {
          name: "Panofield Example",
          type: "Panofield",
          ip: "http://84.104.56.233:9090",
          user: "",
          pass: ""
        }]
      }
      $state.go("app.home");
    }
  }
});
