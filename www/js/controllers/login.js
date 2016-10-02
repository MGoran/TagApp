angular.module('login.controller', []).controller('LoginCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  console.log(localStorage.user);
  if (localStorage.user === undefined || localStorage.user === "") {
    $scope.data = {
      username: "user1",
      password: "password1",
      cameraType: "Dahua",
      cameraIP: "62.238.246.143:9191",
      recorderType: "Panofield",
      //recorderIP: "62.238.246.143:5050" -> vMix
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

      localStorage.user = JSON.stringify($rootScope.user);
      $rootScope.selectedCam = $rootScope.user.cameras[0];
      $state.go("app.home");
    }
  } else {
    $rootScope.user = JSON.parse(localStorage.user);
    $state.go("app.home");
  }
});
