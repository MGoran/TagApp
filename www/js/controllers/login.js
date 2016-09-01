angular.module('login.controller', []).controller('LoginCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $scope.data = {
    username: "user1",
    password: "password1",
    cameraType: "Dahua",
    cameraIP: "62.238.246.143:7070",
    recorderType: "Panofield",
    //recorderIP: "62.238.246.143:5050"
		recorderIP: "84.104.56.233:9090"
  };
  $scope.login = function() {
    console.log($scope.data);
    $rootScope.user = {
      validated: true,
      id: 1,
      cameras: [{
        name: $scope.data.cameraType + "[" + $scope.data.cameraIP + "]",
        recorderType: $scope.data.recorderType,
        cameraType: $scope.data.cameraType,
        cameraIP: $scope.data.cameraIP,
        recorderIP: $scope.data.recorderIP,
        username: $scope.data.username,
        password: $scope.data.password
      }]
    }

    $state.go("app.home");
  }
});
