angular.module('home.controller', []).controller('HomeCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    if (!$rootScope.isUser()) {
      $state.go('login')
    }
  });
  $scope.openStream = function(cam) {
    $rootScope.selectedCam = cam;
    $state.go('app.annotation_controller');
  }

  $scope.startProject = function() {
		$rootScope.selectedCam = $rootScope.user.cameras[0];
    $state.go('app.annotation_controller');
  }

});
