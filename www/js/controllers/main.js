angular.module('main.controller', []).controller('MainCtrl', function($rootScope, $scope, $ionicModal, $timeout, $state) {
  $rootScope.isUser = function (){
    console.log($rootScope.user)
    return $rootScope.user !==undefined && $rootScope.user.validated
  }
  if (localStorage.vc_transparency == undefined || localStorage.vc_transparency == null || localStorage.vc_transparency == "") {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = "50";
    $rootScope.data.dahua_speed = "1";
  } else {
    $rootScope.data = {};
    $rootScope.data.vc_transparency = localStorage.vc_transparency;
    $rootScope.data.dahua_speed = localStorage.dahua_speed;
  }
  $scope.logout = function() {
    $rootScope.user = {};
    $state.go('login');
  }
});
