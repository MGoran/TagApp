angular.module('login.controller', []).controller('LoginCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  //console.log(JSON.parse(localStorage.user));
  if (localStorage.user === undefined || localStorage.user === "") {
    $scope.data = {
      username: "user1",
      password: "password1",
      cameraType: "disabled",
      cameraIP: "62.238.246.143:9191",
      recorderType: "Panofield",
      //recorderIP: "62.238.246.143:5050" -> vMix
      recorderIP: "84.104.56.233:9090"
    };
  } else {
    $rootScope.user = JSON.parse(localStorage.user);
    $scope.data = $rootScope.user.cameras[0];
    $state.go("app.home");
  }
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (localStorage.user !== undefined && localStorage.user !== "") {
      $rootScope.user = JSON.parse(localStorage.user);
      $scope.data = $rootScope.user.cameras[0];
      console.log($scope.data);
    }
  });
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
});
