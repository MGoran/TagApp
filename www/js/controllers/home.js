angular.module('home.controller', []).controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.openStream = function(cam) {
    console.log(cam);
    $rootScope.selectedCam = cam;
    if (cam.type === "Panofield") {
      $state.go('app.panofield');
    } else if (cam.type === "Dahua") {
      $state.go('app.dahua');
    } else if (cam.type === "Axis") {
      $state.go('app.axis');
    }
  }
});
